import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "../../../lib/prisma"

const KARMA_PER_MODERATION = 10
const KARMA_PER_APPROVAL = 50
const APPROVAL_THRESHOLD = 3 // Aprobaciones necesarias para pasar a APPROVED

// GET /api/documents/moderate — Obtener documentos en cuarentena
export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, careerId: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Solo documentos en cuarentena de cursos de la misma carrera
    const documents = await prisma.document.findMany({
      where: {
        status: "QUARANTINE",
        deletedAt: null,
        uploaderId: { not: user.id }, // No moderas tus propios documentos
        course: {
          careers: {
            some: { id: user.careerId || "" }
          }
        },
        votes: {
          none: { userId: user.id }
        }
      },
      include: {
        uploader: { select: { name: true, image: true } },
        course: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // Auto-resolver documentos que ya pasaron las 2 horas
    const now = new Date()
    const validDocuments = []

    for (const doc of documents) {
      const hoursSinceUpload = (now - new Date(doc.createdAt)) / (1000 * 60 * 60)
      
      if (hoursSinceUpload >= 2) {
        // Expiró. Resolver.
        const totalVotes = doc.approvals + doc.rejections
        const isApproved = totalVotes > 0 && (doc.approvals / totalVotes >= 0.70)
        
        await prisma.document.update({
          where: { id: doc.id },
          data: {
            status: isApproved ? "APPROVED" : "REJECTED",
            deletedAt: isApproved ? null : new Date(), // Soft delete
          }
        })
        
        if (isApproved) {
          await prisma.user.update({
            where: { id: doc.uploaderId },
            data: { karma: { increment: KARMA_PER_APPROVAL } }
          })
          await prisma.notification.create({
            data: {
              type: "DOC_APPROVED",
              title: "Apunte aprobado",
              message: `Tu apunte superó el tiempo de evaluación con ${Math.round((doc.approvals / totalVotes)*100)}% de aprobación y ha sido publicado.`,
              userId: doc.uploaderId,
            }
          })
        } else {
          await prisma.notification.create({
            data: {
              type: "DOC_REJECTED",
              title: "Tiempo Expirado",
              message: `Tu apunte no alcanzó la aprobación necesaria en las 2 horas límite y fue caducado.`,
              userId: doc.uploaderId,
            }
          })
        }
      } else {
        validDocuments.push(doc)
      }
    }

    return NextResponse.json({ documents: validDocuments })
  } catch (error) {
    console.error("Error al cargar documentos para moderación:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}

// POST /api/documents/moderate — Aprobar o rechazar un documento
export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { documentId, action } = body

    if (!documentId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 })
    }

    const moderator = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!moderator) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, status: true, createdAt: true, uploaderId: true, approvals: true, rejections: true, courseId: true }
    })

    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    if (document.status !== "QUARANTINE") {
      return NextResponse.json({ error: "Este documento ya fue moderado" }, { status: 409 })
    }

    if (document.uploaderId === moderator.id) {
      return NextResponse.json({ error: "No puedes moderar tus propios documentos" }, { status: 403 })
    }

    if (action === "approve" || action === "reject") {
      const isApprove = action === "approve"
      const newApprovals = document.approvals + (isApprove ? 1 : 0)
      const newRejections = document.rejections + (!isApprove ? 1 : 0)
      const totalVotes = newApprovals + newRejections

      // Check if user already voted
      const existingVote = await prisma.documentVote.findUnique({
        where: {
          documentId_userId: { documentId, userId: moderator.id }
        }
      })

      if (existingVote) {
        return NextResponse.json({ error: "Ya votaste en este documento" }, { status: 409 })
      }

      // Calculate time passed
      const hoursSinceUpload = (new Date() - new Date(document.createdAt)) / (1000 * 60 * 60)
      
      // La regla ahora es: se evalúa a las 2 horas, sin importar cuántos votos
      // Si el moderador está votando y justo pasaron las 2 horas:
      const canResolve = hoursSinceUpload >= 2
      const isApproved = canResolve && (newApprovals / totalVotes >= 0.70)
      const isRejected = canResolve && !isApproved

      const newStatus = isApproved ? "APPROVED" : (isRejected ? "REJECTED" : "QUARANTINE")

      // Transacción: registrar voto + actualizar documento + dar karma al moderador + notificaciones si se resuelve
      await prisma.$transaction(async (tx) => {
        // Registrar voto
        await tx.documentVote.create({
          data: {
            documentId,
            userId: moderator.id,
            voteType: isApprove ? "APPROVE" : "REJECT"
          }
        })

        // Actualizar documento
        await tx.document.update({
          where: { id: documentId },
          data: {
            approvals: newApprovals,
            rejections: newRejections,
            status: newStatus,
            deletedAt: isRejected ? new Date() : null,
          }
        })

        // Karma para el moderador
        await tx.user.update({
          where: { id: moderator.id },
          data: { karma: { increment: KARMA_PER_MODERATION } }
        })

        // Notificación de moderación al moderador
        await tx.notification.create({
          data: {
            type: "KARMA_EARNED",
            title: "Karma ganado",
            message: `Has ganado +${KARMA_PER_MODERATION} Karma Points por moderar un apunte.`,
            userId: moderator.id,
          }
        })

        // Si se resuelve como APROBADO
        if (isApproved) {
          await tx.user.update({
            where: { id: document.uploaderId },
            data: { karma: { increment: KARMA_PER_APPROVAL } }
          })

          await tx.notification.create({
            data: {
              type: "DOC_APPROVED",
              title: "Apunte aprobado",
              message: `Tu apunte ha sido verificado por la comunidad (${newApprovals} votos a favor) y ya está disponible. ¡Ganaste +${KARMA_PER_APPROVAL} Karma!`,
              userId: document.uploaderId,
            }
          })

          // --- Lógica de Notificaciones Inteligentes a Estudiantes Inscritos ---
          try {
            const courseData = await tx.course.findUnique({
              where: { id: document.courseId },
              include: { enrolledUsers: { select: { id: true } } }
            })

            if (courseData && courseData.enrolledUsers.length > 0) {
              const enrolledUserIds = courseData.enrolledUsers
                .filter(u => u.id !== document.uploaderId) // Excluir al que subió el documento
                .map(u => u.id)

              if (enrolledUserIds.length > 0) {
                const notificationTitle = `Hay apuntes nuevos en ${courseData.name}`
                const notifType = `COURSE_DOC:${document.courseId}`
                
                // Evitar spam: consultar si ya tienen esta notificación sin leer
                const existingNotifs = await tx.notification.findMany({
                  where: {
                    userId: { in: enrolledUserIds },
                    type: notifType,
                    title: notificationTitle,
                    isRead: false
                  },
                  select: { userId: true }
                })
                
                const usersWithExistingNotif = new Set(existingNotifs.map(n => n.userId))
                const usersToNotify = enrolledUserIds.filter(id => !usersWithExistingNotif.has(id))

                if (usersToNotify.length > 0) {
                  await tx.notification.createMany({
                    data: usersToNotify.map(userId => ({
                      type: notifType,
                      title: notificationTitle,
                      message: 'Se ha publicado un nuevo documento verificado en el repositorio del curso.',
                      userId: userId
                    }))
                  })
                }
              }
            }
          } catch (notifError) {
            console.error("Error al generar notificaciones de documentos:", notifError)
          }
        } 
        // Si se resuelve como RECHAZADO
        else if (isRejected) {
          await tx.notification.create({
            data: {
              type: "DOC_REJECTED",
              title: "Apunte rechazado",
              message: `Tu apunte no alcanzó la aprobación de la comunidad (${Math.round((newApprovals / totalVotes)*100)}% de aprobación) y ha sido rechazado.`,
              userId: document.uploaderId,
            }
          })
        }
      })

      return NextResponse.json({
        success: true,
        action: action,
        karmaEarned: KARMA_PER_MODERATION,
        published: isApproved,
        rejected: isRejected,
        pending: newStatus === "QUARANTINE"
      })
    }

  } catch (error) {
    console.error("Error en moderación:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}

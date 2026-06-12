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
        }
      },
      include: {
        uploader: { select: { name: true, image: true } },
        course: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ documents })
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
      select: { id: true, status: true, uploaderId: true, approvals: true, rejections: true }
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

    if (action === "approve") {
      const newApprovals = document.approvals + 1
      const shouldPublish = newApprovals >= APPROVAL_THRESHOLD

      // Transacción: actualizar documento + dar karma al moderador + (opcionalmente) al uploader
      await prisma.$transaction(async (tx) => {
        await tx.document.update({
          where: { id: documentId },
          data: {
            approvals: newApprovals,
            status: shouldPublish ? "APPROVED" : "QUARANTINE",
          }
        })

        // Karma para el moderador
        await tx.user.update({
          where: { id: moderator.id },
          data: { karma: { increment: KARMA_PER_MODERATION } }
        })

        // Si se publica, karma para el uploader + notificación
        if (shouldPublish) {
          await tx.user.update({
            where: { id: document.uploaderId },
            data: { karma: { increment: KARMA_PER_APPROVAL } }
          })

          await tx.notification.create({
            data: {
              type: "DOC_APPROVED",
              title: "Apunte aprobado",
              message: `Tu apunte ha sido verificado por ${APPROVAL_THRESHOLD} compañeros y ya está disponible públicamente. ¡Ganaste +${KARMA_PER_APPROVAL} Karma!`,
              userId: document.uploaderId,
            }
          })
        }

        // Notificación de moderación al moderador
        await tx.notification.create({
          data: {
            type: "KARMA_EARNED",
            title: "Karma ganado",
            message: `Has ganado +${KARMA_PER_MODERATION} Karma Points por moderar un apunte.`,
            userId: moderator.id,
          }
        })
      })

      return NextResponse.json({
        success: true,
        action: "approved",
        karmaEarned: KARMA_PER_MODERATION,
        published: newApprovals >= APPROVAL_THRESHOLD,
      })

    } else {
      // Rechazar
      await prisma.$transaction(async (tx) => {
        await tx.document.update({
          where: { id: documentId },
          data: {
            rejections: { increment: 1 },
            status: "REJECTED",
            deletedAt: new Date(), // Soft delete
          }
        })

        await tx.notification.create({
          data: {
            type: "DOC_REJECTED",
            title: "Apunte rechazado",
            message: "Tu apunte ha sido rechazado por un moderador. Verifica que el contenido corresponda al ramo y vuelve a intentarlo.",
            userId: document.uploaderId,
          }
        })
      })

      return NextResponse.json({
        success: true,
        action: "rejected",
      })
    }

  } catch (error) {
    console.error("Error en moderación:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}

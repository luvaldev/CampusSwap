import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"

// GET /api/courses/[id] — Detalle del curso con documentos aprobados y stats
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { id } = await params
  const courseId = decodeURIComponent(id)

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        careers: { select: { id: true, name: true, tag: true } },
        documents: {
          where: {
            deletedAt: null,
            status: { in: ["APPROVED", "QUARANTINE"] },
          },
          include: {
            uploader: { select: { id: true, name: true, image: true } }
          },
          orderBy: { createdAt: "desc" },
        },
        enrolledUsers: {
          select: { id: true }
        },
        _count: {
          select: {
            messages: true,
            enrolledUsers: true,
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    // Separar documentos aprobados y en cuarentena
    const approvedDocs = course.documents.filter(d => d.status === "APPROVED")
    const quarantineDocs = course.documents.filter(d => d.status === "QUARANTINE")

    return NextResponse.json({
      course: {
        id: course.id,
        name: course.name,
        credits: course.credits,
        careers: course.careers,
      },
      documents: {
        approved: approvedDocs,
        quarantine: quarantineDocs,
      },
      stats: {
        totalDocs: approvedDocs.length,
        pendingDocs: quarantineDocs.length,
        enrolledUsers: course._count.enrolledUsers,
        totalMessages: course._count.messages,
      }
    })
  } catch (error) {
    console.error("Error al cargar curso:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}

import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "../../../lib/prisma"

// Blacklist de palabras prohibidas
const BLACKLIST = [
  /\b(put[ao]|maric[oó]n|conce?cha|huevón|cul[ei]a[or]?|weón|ctm|wea|maraco)\b/gi,
]

function maskMessage(content) {
  let masked = content
  let wasMasked = false
  for (const regex of BLACKLIST) {
    if (regex.test(masked)) {
      wasMasked = true
      masked = masked.replace(regex, match => '*'.repeat(match.length))
    }
  }
  return { masked, wasMasked }
}

// GET /api/chat/[courseId] — Obtener mensajes de un curso
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "Las cuentas de invitado no tienen acceso al chat." }, { status: 403 })
  }

  const { courseId } = await params
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get("cursor")
  const take = parseInt(searchParams.get("take") || "50")

  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        courseId: decodeURIComponent(courseId),
        deletedAt: null, // Soft delete: excluir mensajes eliminados
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            image: true, 
            nickname: true, 
            karma: true, 
            career: { select: { name: true } } 
          }
        }
      },
      orderBy: { createdAt: "asc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error al cargar mensajes:", error)
    return NextResponse.json({ error: "Error al cargar mensajes" }, { status: 500 })
  }
}

// POST /api/chat/[courseId] — Enviar un mensaje
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "Las cuentas de invitado no pueden enviar mensajes." }, { status: 403 })
  }

  const { courseId } = await params

  try {
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "Mensaje demasiado largo (max 1000 caracteres)" }, { status: 400 })
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, image: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar que el curso existe
    const course = await prisma.course.findUnique({
      where: { id: decodeURIComponent(courseId) },
    })

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    // Aplicar filtro de blacklist
    const { masked, wasMasked } = maskMessage(content)

    const message = await prisma.chatMessage.create({
      data: {
        content: masked,
        isMasked: wasMasked,
        userId: user.id,
        courseId: decodeURIComponent(courseId),
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            image: true, 
            nickname: true, 
            karma: true, 
            career: { select: { name: true } } 
          }
        }
      }
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("Error al enviar mensaje:", error)
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 })
  }
}

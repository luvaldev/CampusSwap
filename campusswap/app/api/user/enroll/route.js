import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "../../../lib/prisma"

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (session.user?.role === "GUEST") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  try {
    const { courseIds } = await request.json()
    
    // Sobrescribimos los ramos inscritos con los nuevos seleccionados
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        enrolledCourses: { set: courseIds.map(id => ({ id })) }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "../../../lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { careerId: true }
    })

    if (!dbUser || !dbUser.careerId) {
      return NextResponse.json([])
    }

    const career = await prisma.career.findUnique({
      where: { id: dbUser.careerId },
      include: { 
        courses: {
          orderBy: { name: 'asc' }
        }
      }
    })

    return NextResponse.json(career?.courses || [])
  } catch (error) {
    console.error("Error al obtener materias de carrera:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

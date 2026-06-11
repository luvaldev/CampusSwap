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

    // Buscamos al usuario en la DB e incluimos la información de su carrera
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { career: true } 
    })

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error("Error obteniendo el perfil:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
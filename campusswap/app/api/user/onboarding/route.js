// app/api/user/onboarding/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "../../../lib/prisma"

export async function POST(request) {
  // 1. Validar que el usuario tenga una sesión de Google activa
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const { careerId } = await request.json()
    
    if (!careerId) {
      return NextResponse.json({ error: "Falta el ID de la carrera" }, { status: 400 })
    }

    // 2. Actualizar el campo careerId del usuario usando su correo único
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { careerId: careerId },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Error en API onboarding:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
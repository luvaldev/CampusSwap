import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "../../../lib/prisma"

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  if (session.user.role === "GUEST") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  try {
    const { careerId } = await request.json()
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

    // Validar regla de negocio: Cooldown de 20 días
    if (dbUser.lastCareerChange) {
      const diffTime = Math.abs(new Date() - new Date(dbUser.lastCareerChange))
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 20) {
        return NextResponse.json({ 
          error: `Límite de cambio activo. Debes esperar ${20 - diffDays} días más.` 
        }, { status: 403 })
      }
    }

    // Actualizar carrera y estampar marca de tiempo
    await prisma.user.update({
      where: { email: session.user.email },
      data: { careerId, lastCareerChange: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
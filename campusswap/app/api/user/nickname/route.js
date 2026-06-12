import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "../../../lib/prisma"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { nickname } = await request.json()

    // Validation
    if (nickname && nickname.length > 20) {
      return NextResponse.json({ error: "El apodo no puede exceder los 20 caracteres" }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, nicknameLastChangedAt: true }
    })

    // Check cooldown (5 days)
    if (dbUser.nicknameLastChangedAt) {
      const now = new Date()
      const lastChange = new Date(dbUser.nicknameLastChangedAt)
      const diffTime = Math.abs(now - lastChange)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= 5) {
        const daysLeft = 6 - diffDays // 5 full days must pass
        return NextResponse.json(
          { error: `Debes esperar ${daysLeft} día(s) más para volver a cambiar tu apodo.` },
          { status: 403 }
        )
      }
    }

    // Update user
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        nickname: nickname || null,
        nicknameLastChangedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar apodo:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

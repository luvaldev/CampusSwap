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

    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "Imagen no proporcionada" }, { status: 400 })
    }

    // Límite conservador para Base64 comprimido (~150kb, un canvas de 256x256 en jpeg pesará ~15kb)
    if (image.length > 200000) {
      return NextResponse.json({ error: "La imagen excede el tamaño máximo permitido." }, { status: 400 })
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        image: image
      }
    })

    return NextResponse.json({ success: true, image })
  } catch (error) {
    console.error("Error al actualizar foto:", error)
    return NextResponse.json({ error: "Error interno al guardar la foto" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Al dejar en null la imagen, el usuario pierde su imagen personalizada.
    // NextAuth podría volver a traerla desde el Account (o simplemente se mostrará la imagen por defecto).
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        image: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar foto:", error)
    return NextResponse.json({ error: "Error interno al eliminar la foto" }, { status: 500 })
  }
}

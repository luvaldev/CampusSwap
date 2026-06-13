import { NextResponse } from "next/server"
import prisma from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const listing = await prisma.storeListing.findUnique({
      where: { id }
    })

    if (!listing) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    // Solo el dueño o un ADMIN puede borrar
    if (listing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No tienes permiso para eliminar esto" }, { status: 403 })
    }

    await prisma.storeListing.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Store DELETE Error:", error)
    return NextResponse.json({ error: "Error al eliminar la publicación" }, { status: 500 })
  }
}

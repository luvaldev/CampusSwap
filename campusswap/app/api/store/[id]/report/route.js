import { NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    
    // Check if listing exists
    const listing = await prisma.storeListing.findUnique({
      where: { id }
    })

    if (!listing) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    // Set status to REPORTED
    await prisma.storeListing.update({
      where: { id },
      data: { status: "REPORTED" }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Store Report Error:", error)
    return NextResponse.json({ error: "Error al reportar la publicación" }, { status: 500 })
  }
}

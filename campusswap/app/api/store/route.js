import { NextResponse } from "next/server"
import prisma from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const where = {
      status: "ACTIVE"
    }
    if (type && type !== "ALL") {
      where.type = type
    }

    const listings = await prisma.storeListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, image: true, karma: true }
        },
        course: {
          select: { name: true, id: true }
        }
      }
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error("Store GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify karma
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!dbUser || dbUser.karma < 1000) {
      return NextResponse.json({ error: "No tienes suficiente karma para crear publicaciones." }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, price, contactUrl, type, courseId } = body

    if (!title || !description || !contactUrl || !type) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    if (type !== "TUTORIA" && type !== "APUNTE") {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    const listingData = {
      title,
      description,
      price: parseInt(price) || 0,
      contactUrl,
      type,
      userId: session.user.id,
    }

    if (courseId) {
      listingData.courseId = courseId
    }

    const listing = await prisma.storeListing.create({
      data: listingData
    })

    return NextResponse.json({ listing })
  } catch (error) {
    console.error("Store POST Error:", error)
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
  }
}

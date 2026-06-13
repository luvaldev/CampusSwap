import { NextResponse } from "next/server"
import prisma from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only fetch REPORTED listings
    const listings = await prisma.storeListing.findMany({
      where: {
        status: "REPORTED"
      },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { name: true, id: true } }
      },
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error("Moderate GET Listings Error:", error)
    return NextResponse.json({ error: "Error fetching reported listings" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { listingId, action } = await request.json()
    if (!listingId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    const listing = await prisma.storeListing.findUnique({ where: { id: listingId } })
    if (!listing) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    if (action === "approve") {
      // Restore to active (dismiss report)
      await prisma.storeListing.update({
        where: { id: listingId },
        data: { status: "ACTIVE" }
      })
      
      // Optionally give karma for moderating
      const karmaEarned = 5
      await prisma.user.update({
        where: { id: session.user.id },
        data: { karma: { increment: karmaEarned } }
      })

      return NextResponse.json({ success: true, restored: true, karmaEarned })
    } else {
      // Reject -> Delete it permanently
      await prisma.storeListing.delete({
        where: { id: listingId }
      })
      return NextResponse.json({ success: true, deleted: true })
    }

  } catch (error) {
    console.error("Moderate POST Listings Error:", error)
    return NextResponse.json({ error: "Error moderating listing" }, { status: 500 })
  }
}

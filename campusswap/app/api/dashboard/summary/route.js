import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "../../../lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) return NextResponse.json({ error: "No auth" }, { status: 401 })

    // Traemos la información del usuario, estadísticas y actividad reciente de forma paralela
    const [user, totalUsers, totalDocs, recentDocs] = await Promise.all([
      prisma.user.findUnique({
        where: { email: session.user.email },
        include: { 
          career: true,          // Solo info básica de la carrera
          enrolledCourses: true  // Ramos seleccionados
        }
      }),
      prisma.user.count(),
      prisma.document.count({ where: { status: "APPROVED" } }),
      prisma.document.findMany({
        take: 3, 
        orderBy: { createdAt: 'desc' }, 
        include: { uploader: true, course: true }
      })
    ])

    const recentActivity = recentDocs.map(doc => ({
      id: doc.id,
      text: `${doc.uploader.name?.split(" ")[0]} subió un apunte`,
      sub: doc.course.name,
      time: "Reciente"
    }))

    return NextResponse.json({ user, stats: { totalUsers, totalDocs }, recentActivity })
  } catch (error) {
    console.error("Error en dashboard summary:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
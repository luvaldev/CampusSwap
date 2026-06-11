import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import prisma from "../../../lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) return NextResponse.json({ error: "No auth" }, { status: 401 })

    // Traemos al usuario, su malla completa (para el selector) y sus ramos inscritos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        career: { include: { courses: true } }, // Malla completa
        enrolledCourses: true                   // Ramos seleccionados
      }
    })

    const totalUsers = await prisma.user.count()
    const totalDocs = await prisma.document.count({ where: { status: "APPROVED" } })

    // Actividad reciente 100% real (si no hay, devuelve arreglo vacío)
    const recentDocs = await prisma.document.findMany({
      take: 3, orderBy: { createdAt: 'desc' }, include: { uploader: true, course: true }
    })

    const recentActivity = recentDocs.map(doc => ({
      id: doc.id,
      text: `${doc.uploader.name?.split(" ")[0]} subió un apunte`,
      sub: doc.course.name,
      time: "Reciente"
    }))

    return NextResponse.json({ user, stats: { totalUsers, totalDocs }, recentActivity })
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
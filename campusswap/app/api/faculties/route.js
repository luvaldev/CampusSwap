// app/api/faculties/route.js
import { NextResponse } from "next/server"
import prisma from "../../lib/prisma" 

export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        careers: true,
      },
    })
    
    return NextResponse.json(faculties)
  } catch (error) {
    console.error("Error en API faculties:", error)
    return NextResponse.json({ error: "Error al obtener las facultades" }, { status: 500 })
  }
}
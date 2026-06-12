import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "../../../lib/prisma"

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

// Magic Numbers — IDEA.md §B: Enterprise-level file validation
const MAGIC_NUMBERS = {
  'application/pdf': {
    hex: [0x25, 0x50, 0x44, 0x46], // %PDF
    ext: 'PDF',
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    hex: [0x50, 0x4B, 0x03, 0x04], // PK.. (ZIP container for DOCX)
    ext: 'DOCX',
  },
  'image/jpeg': {
    hex: [0xFF, 0xD8, 0xFF],
    ext: 'JPG',
  },
  'image/png': {
    hex: [0x89, 0x50, 0x4E, 0x47], // .PNG
    ext: 'PNG',
  },
}

function validateMagicNumbers(buffer, declaredType) {
  const magic = MAGIC_NUMBERS[declaredType]
  if (!magic) return false

  const bytes = new Uint8Array(buffer.slice(0, magic.hex.length))
  return magic.hex.every((byte, i) => bytes[i] === byte)
}

// POST /api/documents/upload
export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  if (session.user.role === "GUEST") {
    return NextResponse.json({ error: "Las cuentas de invitado no tienen permisos para subir archivos." }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const courseId = formData.get("courseId")
    const title = formData.get("title")

    // Validations
    if (!file || !courseId) {
      return NextResponse.json({ error: "Archivo y curso son obligatorios" }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: `El archivo supera el límite de ${MAX_SIZE_BYTES / 1024 / 1024}MB` }, { status: 400 })
    }

    // Validate file type via Magic Numbers
    const declaredType = file.type
    if (!MAGIC_NUMBERS[declaredType]) {
      return NextResponse.json({
        error: "Formato no permitido. Solo se aceptan: PDF, DOCX, JPG, PNG"
      }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    if (!validateMagicNumbers(arrayBuffer, declaredType)) {
      return NextResponse.json({
        error: "El archivo no coincide con su extensión declarada. Posible archivo malicioso."
      }, { status: 422 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, careerId: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verify user can upload to this course (same career restriction per IDEA.md §B)
    const course = await prisma.course.findUnique({
      where: { id: decodeURIComponent(courseId) },
      include: {
        careers: { select: { id: true } }
      }
    })

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    const userCareerInCourse = course.careers.some(c => c.id === user.careerId)
    if (!userCareerInCourse) {
      return NextResponse.json({
        error: "Solo puedes subir apuntes a cursos de tu propia carrera"
      }, { status: 403 })
    }

    // TODO: Upload to Supabase Storage quarantine bucket
    // For now, generate a placeholder URL
    const fileFormat = MAGIC_NUMBERS[declaredType].ext
    const fileUrl = `quarantine/${user.id}/${Date.now()}_${file.name}`

    // Create document record in Prisma
    const document = await prisma.document.create({
      data: {
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        fileUrl,
        size: parseFloat((file.size / 1024 / 1024).toFixed(2)),
        format: fileFormat,
        status: "QUARANTINE",
        uploaderId: user.id,
        courseId: decodeURIComponent(courseId),
      }
    })

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        status: document.status,
        format: document.format,
        size: document.size,
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error al subir documento:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}

import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import prisma from "../../../lib/prisma"
import { supabase } from "../../../lib/supabase"
import sharp from "sharp"

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

    let finalBuffer = Buffer.from(arrayBuffer)
    let finalExt = file.name.split('.').pop()
    let finalContentType = declaredType
    let fileFormat = MAGIC_NUMBERS[declaredType].ext
    let finalSizeMB = parseFloat((file.size / 1024 / 1024).toFixed(2))

    // Optimización con Sharp si es imagen
    if (declaredType.startsWith('image/')) {
      try {
        finalBuffer = await sharp(finalBuffer)
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer()
        
        finalExt = 'webp'
        finalContentType = 'image/webp'
        fileFormat = 'WEBP'
        finalSizeMB = parseFloat((finalBuffer.length / 1024 / 1024).toFixed(2))
      } catch (err) {
        console.error("Error optimizando imagen:", err)
        // Continuar con original si falla
      }
    }

    if (!supabase) {
      return NextResponse.json({ 
        error: "Servicio de almacenamiento no configurado. Revisa las variables de entorno de Supabase." 
      }, { status: 500 })
    }

    // Subir a Supabase Storage
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${finalExt}`
    const filePath = `${user.id}/${fileName}`

    try {
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('campusswap')
        .upload(filePath, finalBuffer, {
          contentType: finalContentType,
          upsert: true
        })

      if (uploadError) {
        throw uploadError
      }
    } catch (error) {
      console.error("Supabase Storage Error:", error)
      return NextResponse.json({ error: "Error al guardar el archivo en la nube. Revisa las variables de Supabase." }, { status: 500 })
    }

    // Obtener URL pública de Supabase Storage
    const { data: { publicUrl } } = supabase
      .storage
      .from('campusswap')
      .getPublicUrl(filePath)
    
    const fileUrl = publicUrl

    // Create document record in Prisma
    const document = await prisma.document.create({
      data: {
        title: title || file.name.replace(/\.[^/.]+$/, ""),
        fileUrl,
        size: finalSizeMB,
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
        fileUrl: document.fileUrl
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error al subir documento:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}

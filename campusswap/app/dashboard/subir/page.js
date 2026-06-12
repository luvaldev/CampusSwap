'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  UploadSimple, FileText, CheckCircle, WarningCircle,
  CloudArrowUp, X, Info, Image as ImageIcon
} from "@phosphor-icons/react"
import CustomSelect from "../../components/CustomSelect"
import GuestRestricted from "../../components/GuestRestricted"

import { carrerasDB, cursosDB } from "../../data/database"

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
]
const MAX_SIZE_MB = 10

export default function SubirApunte() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userCareer, setUserCareer] = useState(null)
  const [selectedCarrera, setSelectedCarrera] = useState(null)
  const [selectedCurso, setSelectedCurso] = useState("")
  const [title, setTitle] = useState("")
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    if (status === "authenticated") {
      const savedCareerId = localStorage.getItem("userCareerId")
      if (savedCareerId) {
        const careerObj = carrerasDB.find(c => c.id === savedCareerId)
        setUserCareer(careerObj)
        setSelectedCarrera(careerObj)
      }
    }
  }, [status, router])

  if (session?.user?.role === 'GUEST') return <GuestRestricted />

  const handleFileInput = (e) => {
    const f = e.target.files?.[0]
    if (f) validateAndSetFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) validateAndSetFile(f)
  }

  const validateAndSetFile = (f) => {
    setUploadError("")
    if (!ALLOWED_TYPES.includes(f.type)) {
      setUploadError('Formato no permitido. Solo se aceptan: PDF, DOCX, JPG, PNG')
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`El archivo no puede superar ${MAX_SIZE_MB}MB`)
      return
    }
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file || !selectedCurso) return
    setUploading(true)
    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("courseId", selectedCurso)
      formData.append("title", title || file.name.replace(/\.[^/.]+$/, ""))

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        setUploaded(true)
      } else {
        const data = await res.json()
        setUploadError(data.error || "Error al subir archivo")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setUploadError("Error de conexión")
    } finally {
      setUploading(false)
    }
  }

  const cursosDisponibles = selectedCarrera ? cursosDB.filter(c => c.carreras.includes(selectedCarrera.id)) : []

  if (status === "loading" || !mounted) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner spinner-lg" /></div>
  }

  if (uploaded) {
    return (
      <div className="upload-success">
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success-subtle)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
          <CheckCircle size={28} weight="fill" color="var(--success)" />
        </div>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Apunte Enviado</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: '45ch', margin: '0 auto var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
          Tu archivo ha sido enviado a <strong>cuarentena</strong> para revisión por tus compañeros. Recibirás una notificación cuando sea aprobado.
        </p>

        <div className="alert alert-brand" style={{ maxWidth: 400, margin: '0 auto var(--space-6)', textAlign: 'left' }}>
          <Info size={18} style={{ flexShrink: 0 }} />
          <p>El sistema de moderación peer-to-peer garantiza la calidad del material académico.</p>
        </div>

        <div className="flex-col-mobile" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <button onClick={() => { setFile(null); setSelectedCurso(""); setTitle(""); setUploaded(false); }} className="btn btn-secondary w-full-mobile">
            Subir otro apunte
          </button>
          <button onClick={() => router.push('/dashboard')} className="btn btn-primary w-full-mobile">
            Ir al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>Contribuye al conocimiento</p>
        <h1 className="page-title">Subir Apunte</h1>
        <p className="page-subtitle">Comparte tu material académico con los alumnos de tu carrera.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Title */}
        <div>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>
            Título del apunte (opcional)
          </label>
          <input
            className="input"
            type="text"
            placeholder="Ej: Resumen Solemne 1 - Cálculo I"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Course Selection */}
        <div>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>
            Ramo destinatario
          </label>
          <CustomSelect
            options={cursosDisponibles.map(c => ({ value: c.id, label: `${c.id} · ${c.nombre}` }))}
            value={selectedCurso}
            onChange={setSelectedCurso}
            placeholder="Seleccionar un ramo..."
          />
        </div>

        {/* Dropzone */}
        <div>
          <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>
            Archivo
          </label>

          {!file ? (
            <div
              className={`dropzone ${dragOver ? 'dropzone-active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--brand)' : 'var(--border-default)'}`,
                background: dragOver ? 'color-mix(in oklch, var(--brand) 5%, transparent)' : 'var(--surface-1)',
                padding: 'var(--space-10) var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200
              }}
            >
              <div style={{ 
                background: dragOver ? 'var(--brand)' : 'var(--surface-2)', 
                width: 64, height: 64, borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 'var(--space-4)',
                transition: 'all var(--duration-fast)'
              }}>
                <CloudArrowUp size={32} color={dragOver ? 'var(--text-on-brand)' : 'var(--text-muted)'} />
              </div>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                Arrastra tu archivo aquí o <span style={{ color: 'var(--brand)', textDecoration: 'underline' }}>haz clic para buscar</span>
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                PDF, DOCX, JPG, PNG — máximo {MAX_SIZE_MB}MB
              </p>
              <input id="fileInput" type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" onChange={handleFileInput} style={{ display: 'none' }} />
            </div>
          ) : (
            <div className="card file-row-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
                <div className="icon-box icon-box-md" style={{ background: 'var(--success-subtle)', flexShrink: 0 }}>
                  {file.type.startsWith('image/') ? <ImageIcon size={20} color="var(--success)" /> : <FileText size={20} color="var(--success)" />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)', maxWidth: '100%' }}>{file.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="btn btn-ghost btn-sm" aria-label="Remover archivo" style={{ alignSelf: 'center' }}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {uploadError && (
          <div className="alert alert-danger">
            <WarningCircle size={18} style={{ flexShrink: 0 }} />
            <p>{uploadError}</p>
          </div>
        )}

        {/* Quarantine notice */}
        <div className="alert alert-brand">
          <WarningCircle size={18} style={{ flexShrink: 0 }} />
          <p>Los archivos son enviados a <strong>cuarentena</strong> antes de ser publicados. Otro estudiante validará que el contenido corresponde al ramo.</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleUpload}
          disabled={uploading || !file || !selectedCurso}
          className="btn btn-primary btn-lg btn-full"
        >
          {uploading ? (
            <><div className="spinner spinner-sm" /> Subiendo archivo...</>
          ) : (
            <><UploadSimple size={20} weight="bold" /> Subir Apunte</>
          )}
        </button>
      </div>

      <style>{`
        .upload-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--space-16) var(--space-6);
        }
      `}</style>
    </div>
  )
}
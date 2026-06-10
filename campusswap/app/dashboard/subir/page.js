'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import {
  LayoutDashboard, Search, UploadCloud, Shield, LogOut,
  BookOpen, ChevronRight, CheckCircle, ArrowLeft, Star,
  FileText, Upload, AlertCircle, Compass
} from "lucide-react"

// Importamos nuestra Base de Datos Dinámica
import { carrerasDB, cursosDB } from "../../data/database"

/* ─── Mock Data de Facultades ────────────────────── */
const FACULTADES = [
  { id: 'fae', nombre: 'Facultad de Administración y Economía' },
  { id: 'fad', nombre: 'Facultad de Arquitectura, Arte y Diseño' },
  { id: 'fic', nombre: 'Facultad de Ingeniería y Ciencias' }, // Única con datos de prueba
  { id: 'fme', nombre: 'Facultad de Medicina' },
];

export default function SubirApunte() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [mounted, setMounted] = useState(false)
  const [userCareer, setUserCareer] = useState(null)
  
  // ESTADOS DEL FORMULARIO
  const [facultad, setFacultad] = useState("")
  const [carrera, setCarrera] = useState("")
  const [ramo, setRamo] = useState("")
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // ESTADO DE SUBIDA
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    if (status === "authenticated") {
      const savedCareerId = localStorage.getItem("userCareerId")
      if (savedCareerId) setUserCareer(carrerasDB.find(c => c.id === savedCareerId))
    }
  }, [status, router])

  // MANEJO DE ARCHIVOS (DRAG & DROP)
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); }
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0])
  }

  const handleSubmit = () => {
    if (!facultad || !carrera || !ramo || !file) return
    setIsUploading(true)
    
    // Simular el tiempo de subida a la Base de Datos / AWS S3
    setTimeout(() => {
      setIsUploading(false)
      setUploadSuccess(true)
      
      // Limpiar el formulario después de 3 segundos
      setTimeout(() => {
        setUploadSuccess(false)
        setFile(null)
        setRamo("")
      }, 4000)
    }, 2000)
  }

  // Filtrado de combos
  const carrerasDisponibles = facultad === 'fic' ? carrerasDB : []
  const cursosDisponibles = carrera ? cursosDB.filter(c => c.carreras.includes(carrera)) : []

  if (status === "loading" || !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#060410' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid rgba(139,92,246,0.2)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        
        <div style={{ width: '100%', maxWidth: '700px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <button 
              onClick={() => router.back()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', fontSize: '13px', marginBottom: '16px', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#bb86fc'}
              onMouseLeave={e => e.currentTarget.style.color = '#8892b0'}
            >
              <ArrowLeft style={{ width: '16px', height: '16px' }} /> Volver
            </button>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: '800', color: '#f0ecff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              Compartir Material 📤
            </h1>
            <p style={{ color: '#8892b0', fontSize: '14px', marginTop: '8px', lineHeight: 1.5 }}>
              Sube tus apuntes, certámenes o resúmenes. Todos los archivos pasarán por un <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>estado de cuarentena</span> hasta ser validados por la comunidad.
            </p>
          </div>

          {/* Formulario */}
          <div style={{ background: 'linear-gradient(135deg, rgba(26,22,64,0.6) 0%, rgba(18,16,42,0.8) 100%)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
            
            {uploadSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', animation: 'fadeIn 0.5s ease' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle style={{ width: '32px', height: '32px', color: '#10b981' }} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399', marginBottom: '8px', fontFamily: "'Syne', sans-serif" }}>¡Archivo enviado a Cuarentena!</h2>
                <p style={{ color: '#8892b0', fontSize: '14px', marginBottom: '24px' }}>Tu documento está siendo revisado por la comunidad. Recibirás <strong style={{ color: '#fbbf24' }}>+20 Karma Points</strong> si es aprobado.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  {/* Select Facultad */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '600' }}>1. Facultad</label>
                    <select value={facultad} onChange={e => { setFacultad(e.target.value); setCarrera(""); setRamo(""); }} style={{ width: '100%', background: '#0a0514', border: '1px solid rgba(139,92,246,0.3)', color: '#f0ecff', borderRadius: '10px', padding: '12px', outline: 'none' }}>
                      <option value="" disabled>Selecciona facultad...</option>
                      {FACULTADES.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                  </div>

                  {/* Select Carrera */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '600' }}>2. Carrera</label>
                    <select disabled={!facultad} value={carrera} onChange={e => { setCarrera(e.target.value); setRamo(""); }} style={{ width: '100%', background: facultad ? '#0a0514' : 'rgba(10,5,20,0.5)', border: '1px solid rgba(139,92,246,0.3)', color: '#f0ecff', borderRadius: '10px', padding: '12px', outline: 'none', opacity: facultad ? 1 : 0.5 }}>
                      <option value="" disabled>{facultad === 'fic' ? 'Selecciona carrera...' : facultad ? 'No hay carreras indexadas' : 'Espera facultad...'}</option>
                      {carrerasDisponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                </div>

                {/* Select Ramo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
                  <label style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '600' }}>3. Asignatura / Ramo</label>
                  <select disabled={!carrera} value={ramo} onChange={e => setRamo(e.target.value)} style={{ width: '100%', background: carrera ? '#0a0514' : 'rgba(10,5,20,0.5)', border: '1px solid rgba(139,92,246,0.3)', color: '#f0ecff', borderRadius: '10px', padding: '12px', outline: 'none', opacity: carrera ? 1 : 0.5 }}>
                    <option value="" disabled>Selecciona el ramo al que pertenece el apunte...</option>
                    {cursosDisponibles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>

                {/* Zona de Drag & Drop */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '600', marginBottom: '8px', display: 'block' }}>4. Tu Archivo (.pdf, .docx)</label>
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: isDragging ? '2px dashed #bb86fc' : '2px dashed rgba(139,92,246,0.3)',
                      background: isDragging ? 'rgba(124,58,237,0.1)' : 'rgba(10,5,20,0.4)',
                      borderRadius: '16px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.docx,.doc" style={{ display: 'none' }} />
                    
                    {file ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText style={{ width: '24px', height: '24px', color: '#34d399' }} />
                        </div>
                        <div>
                          <p style={{ color: '#f0ecff', fontWeight: 'bold', fontSize: '15px' }}>{file.name}</p>
                          <p style={{ color: '#8892b0', fontSize: '12px', marginTop: '4px' }}>{(file.size / (1024*1024)).toFixed(2)} MB</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '13px', cursor: 'pointer', marginTop: '8px', textDecoration: 'underline' }}>
                          Cambiar archivo
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud style={{ width: '40px', height: '40px', color: isDragging ? '#bb86fc' : '#5c527a', margin: '0 auto 16px', transition: 'color 0.2s' }} />
                        <p style={{ color: '#f0ecff', fontWeight: 'bold', fontSize: '16px' }}>Arrastra tu archivo aquí</p>
                        <p style={{ color: '#8892b0', fontSize: '13px', marginTop: '4px' }}>o haz clic para explorar en tu dispositivo</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Advertencia y Botón Submit */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', padding: '12px 16px', borderRadius: '10px', marginBottom: '24px' }}>
                  <AlertCircle style={{ width: '18px', height: '18px', color: '#f59e0b', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#fde68a', lineHeight: 1.5 }}>
                    Al subir este archivo confirmas que es material académico válido. Subir spam o archivos maliciosos resultará en una <strong style={{ color: '#fbbf24' }}>penalización de Karma</strong>.
                  </p>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={!facultad || !carrera || !ramo || !file || isUploading}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold',
                    background: (!facultad || !carrera || !ramo || !file) ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    color: (!facultad || !carrera || !ramo || !file) ? '#5c527a' : 'white',
                    border: 'none', cursor: (!facultad || !carrera || !ramo || !file || isUploading) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: (!facultad || !carrera || !ramo || !file) ? 'none' : '0 4px 20px rgba(124,58,237,0.4)'
                  }}
                >
                  {isUploading ? (
                    <>
                      <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Subiendo archivo...
                    </>
                  ) : (
                    <>
                      <Upload style={{ width: '18px', height: '18px' }} />
                      Enviar a Cuarentena
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  )
}
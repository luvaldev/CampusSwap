'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, Search, UploadCloud,
  Star, LogOut, Shield, BookOpen, ChevronRight,
  CheckCircle, XCircle, FileText, AlertTriangle, Clock, ThumbsUp
} from "lucide-react"

// Importamos nuestra Base de Datos Dinámica para el tag del perfil
import { carrerasDB } from "../../data/database"

/* ─── Mock Data de Archivos en Cuarentena ────────────────── */
const INITIAL_QUARANTINE_FILES = [
  { id: 'f1', name: 'Resumen Completo: Normalización y Álgebra Relacional', course: 'Bases de Datos', code: 'ING-312', uploader: 'Diego R.', date: 'Hace 4 horas', size: '2.4 MB', format: 'PDF' },
  { id: 'f2', name: 'Guía Práctica de Patrones de Diseño Creacionales GoF', course: 'Ingeniería de Software', code: 'ING-420', uploader: 'Catalina M.', date: 'Hace 1 día', size: '1.8 MB', format: 'PDF' },
  { id: 'f3', name: 'Apuntes de Cátedra: Pipeline y Memoria Caché', course: 'Arquitectura de Computadores', code: 'ING-215', uploader: 'Tomás S.', date: 'Hace 2 días', size: '4.1 MB', format: 'DOCX' },
];

/* ─── Subcomponente de Tarjeta de Estadísticas ───────────── */
function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'rgba(26,22,64,0.5)',
      border: '1px solid rgba(139,92,246,0.12)',
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'border-color 0.2s',
      cursor: 'default'
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)'}
    >
      <div style={{
        width: '38px', height: '38px',
        borderRadius: '10px',
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon style={{ width: '18px', height: '18px', color }} />
      </div>
      <div>
        <p style={{ fontSize: '26px', fontWeight: '700', fontFamily: "'Syne', sans-serif", color: '#f0ecff', lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '13px', color: '#9b8fc4', marginTop: '4px' }}>{label}</p>
        {sub && <p style={{ fontSize: '11px', color: '#5c527a', marginTop: '2px' }}>{sub}</p>}
      </div>
    </div>
  )
}

/* ─── Componente Principal del Panel de Moderación ───────── */
export default function Moderacion() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userCareer, setUserCareer] = useState(null)

  // ESTADOS DE LA ACCIÓN DE MODERACIÓN
  const [files, setFiles] = useState(INITIAL_QUARANTINE_FILES)
  const [karmaGained, setKarmaGained] = useState(0)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success") // success | error

  useEffect(() => { setMounted(true) }, [])

  // Proteger ruta y cargar carrera
  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    
    if (status === "authenticated") {
      const savedCareerId = localStorage.getItem("userCareerId")
      if (savedCareerId) {
        const careerObj = carrerasDB.find(c => c.id === savedCareerId)
        setUserCareer(careerObj)
      }
    }
  }, [status, router])

  // LÓGICA DE ACCIONES (INTERACTIVIDAD)
  const triggerToast = (message, type) => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => setToastMessage(""), 4000)
  }

  const handleApprove = (id, fileName) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== id))
    setKarmaGained(prev => prev + 10)
    triggerToast(`¡Apunte aprobado! Has ganado +10 Karma Points por validar: "${fileName}"`, "success")
  }

  const handleReject = (id, fileName) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== id))
    triggerToast(`Apunte rechazado correctamente. Gracias por mantener la calidad del material.`, "error")
  }

  if (status === "loading" || !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#060410' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid rgba(139,92,246,0.2)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (status === "unauthenticated") return null

  return (
    <>
      
      {/* ── ALERTA FLOTANTE (TOAST NOTIFICATION) ── */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 100,
          background: toastType === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: toastType === 'success' ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(239,68,68,0.4)',
          color: toastType === 'success' ? '#34d399' : '#f87171',
          padding: '16px 24px', borderRadius: '12px', backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.3)', width: '380px', fontSize: '13px',
          lineHeight: 1.4, animation: 'fadeInRight 0.3s ease'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            {toastType === 'success' ? <CheckCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} /> : <XCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />}
            <p>{toastMessage}</p>
          </div>
        </div>
      )}

      {/* ── Contenido Principal ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', width: '100%' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', color: '#5c527a', marginBottom: '4px', fontWeight: '300' }}>Control de Calidad Académica</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: '800', color: '#f0ecff', letterSpacing: '-0.5px', lineHeight: 1 }}>
            Panel de Moderación 
          </h1>
          <p style={{ color: '#8892b0', fontSize: '14px', marginTop: '8px', maxWidth: '700px', lineHeight: 1.5 }}>
            Revisa los apuntes en cuarentena subidos por tus compañeros de la UDP. Valida que correspondan al ramo y no infrinjan normas para ganar <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>+10 Karma Points</span> por archivo.
          </p>
        </div>

        {/* Indicadores clave */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '32px' }}>
          <StatCard icon={AlertTriangle} label="Documentos en espera" value={files.length.toString()} color="#f59e0b" />
          <StatCard icon={Star} label="Karma ganado hoy" value={`+${karmaGained}`} sub="Sumado a tu perfil" color="#fbbf24" />
          <StatCard icon={Shield} label="Tu nivel de Auditor" value="Rango Bronce" sub="Próximo rango a los 200 pts" color="#10b981" />
        </div>

        {/* Contenedor de la Tabla/Lista de Cuarentena */}
        <div style={{
          background: 'rgba(26,22,64,0.3)',
          border: '1px solid rgba(139,92,246,0.12)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 30px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '700', color: '#f0ecff', marginBottom: '20px' }}>
            Cola de Revisión de Material
          </h2>

          {files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', border: '1px dashed rgba(139,92,246,0.2)', borderRadius: '12px' }}>
              <ThumbsUp style={{ width: '42px', height: '42px', color: '#10b981', margin: '0 auto 16px' }} />
              <p style={{ color: '#f0ecff', fontWeight: 'bold', fontSize: '16px' }}>¡Excelente trabajo!</p>
              <p style={{ color: '#8892b0', fontSize: '13px', marginTop: '4px' }}>No quedan archivos pendientes de moderación en tu malla por ahora.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {files.map(file => (
                <div 
                  key={file.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(18,16,42,0.6)', border: '1px solid rgba(139,92,246,0.08)',
                    borderRadius: '12px', padding: '16px 20px', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.08)'}
                >
                  {/* Información Izquierda del archivo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '8px',
                      background: 'rgba(245,158,11,0.1)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <FileText style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ color: '#f0ecff', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.name}>
                        {file.name}
                      </h4>
                      <p style={{ color: '#5c527a', fontSize: '12px', marginTop: '4px' }}>
                        <span style={{ color: '#a78bfa', fontWeight: '500' }}>{file.course} ({file.code})</span> · Subido por {file.uploader}
                      </p>
                    </div>
                  </div>

                  {/* Metadatos del centro */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: '0 24px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock style={{ width: '13px', height: '13px', color: '#5c527a' }} />
                      <span style={{ fontSize: '12px', color: '#5c527a' }}>{file.date}</span>
                    </div>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: '#8892b0', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      {file.format} · {file.size}
                    </span>
                  </div>

                  {/* Botones de acción Interactivos (Derecha) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <button 
                      onClick={() => handleReject(file.id, file.name)}
                      style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171', padding: '8px 14px', borderRadius: '8px', fontSize: '13px',
                        fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    >
                      Rechazar
                    </button>
                    <button 
                      onClick={() => handleApprove(file.id, file.name)}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none',
                        color: 'white', padding: '8px 14px', borderRadius: '8px', fontSize: '13px',
                        fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                        boxShadow: '0 2px 10px rgba(16,185,129,0.2)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Aprobar ✓
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </>
  )
}
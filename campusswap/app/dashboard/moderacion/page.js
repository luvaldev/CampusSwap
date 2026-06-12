'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Shield, Star, CheckCircle, XCircle, FileText,
  WarningCircle, Clock, ThumbsUp
} from "@phosphor-icons/react"
import GuestRestricted from "../../components/GuestRestricted"

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="icon-box icon-box-md" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}>
        <Icon size={18} weight="fill" style={{ color }} />
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
        {sub && <p className="stat-unit">{sub}</p>}
      </div>
    </div>
  )
}

export default function Moderacion() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [karmaGained, setKarmaGained] = useState(0)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    if (status === "authenticated") fetchDocuments()
  }, [status, router])

  if (session?.user?.role === 'GUEST') return <GuestRestricted />

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents/moderate")
      if (res.ok) {
        const data = await res.json()
        setFiles(data.documents || [])
      }
    } catch (err) {
      console.error("Error fetching documents:", err)
    } finally {
      setLoading(false)
    }
  }

  const triggerToast = (message, type) => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => setToastMessage(""), 4000)
  }

  const handleModerate = async (documentId, action, fileName) => {
    setProcessingId(documentId)
    try {
      const res = await fetch("/api/documents/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, action }),
      })

      if (res.ok) {
        const data = await res.json()
        setFiles(prev => prev.filter(f => f.id !== documentId))

        if (action === "approve") {
          setKarmaGained(prev => prev + (data.karmaEarned || 10))
          triggerToast(
            data.published
              ? `Apunte publicado. +${data.karmaEarned} Karma. El documento alcanzó el umbral de aprobaciones.`
              : `Apunte aprobado. +${data.karmaEarned} Karma Points por validar: "${fileName}"`,
            "success"
          )
        } else {
          triggerToast(`Apunte rechazado. Gracias por mantener la calidad del material.`, "error")
        }
      } else {
        const err = await res.json()
        triggerToast(err.error || "Error al moderar", "error")
      }
    } catch (err) {
      console.error("Error moderating:", err)
      triggerToast("Error de conexión", "error")
    } finally {
      setProcessingId(null)
    }
  }

  if (status === "loading" || !mounted) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner spinner-lg" /></div>
  }

  if (status === "unauthenticated") return null

  return (
    <div style={{ width: '100%' }}>
      {/* Toast */}
      {toastMessage && (
        <div className={`toast ${toastType === 'success' ? 'toast-success' : 'toast-danger'}`}>
          {toastType === 'success' ? <CheckCircle size={18} weight="fill" style={{ flexShrink: 0 }} /> : <XCircle size={18} weight="fill" style={{ flexShrink: 0 }} />}
          <p>{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>Control de Calidad Académica</p>
        <h1 className="page-title">Panel de Moderación</h1>
        <p className="page-subtitle">
          Revisa los apuntes en cuarentena subidos por tus compañeros. Valida que correspondan al ramo para ganar <span className="badge badge-karma" style={{ display: 'inline-flex' }}>+10 Karma</span> por archivo.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <StatCard icon={WarningCircle} label="Documentos en espera" value={files.length.toString()} color="var(--warning)" />
        <StatCard icon={Star} label="Karma ganado hoy" value={`+${karmaGained}`} sub="Sumado a tu perfil" color="var(--karma)" />
        <StatCard icon={Shield} label="Tu nivel de Auditor" value="Rango Bronce" sub="Próximo rango a los 200 pts" color="var(--success)" />
      </div>

      {/* Queue */}
      <div className="card">
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>Cola de Revisión de Material</h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72 }} />)}
          </div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <ThumbsUp size={42} weight="fill" color="var(--success)" style={{ marginBottom: 'var(--space-4)' }} />
            <p style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Excelente trabajo</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>No quedan archivos pendientes de moderación.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {files.map(file => (
              <div key={file.id} className="file-row" style={{ flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
                  <div className="icon-box icon-box-md" style={{ background: 'var(--warning-subtle)' }}>
                    <FileText size={18} color="var(--warning)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }} title={file.title}>{file.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: '2px' }}>
                      <span className="mono" style={{ color: 'var(--brand)', fontWeight: 600 }}>
                        {file.course?.name || 'Curso'} ({file.course?.id || ''})
                      </span> · Subido por {file.uploader?.name || 'Anónimo'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Clock size={13} color="var(--text-muted)" />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {new Date(file.createdAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <span className="badge badge-neutral mono">{file.format} · {file.size} MB</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <button
                    onClick={() => handleModerate(file.id, "reject", file.title)}
                    disabled={processingId === file.id}
                    className="btn btn-danger btn-sm"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleModerate(file.id, "approve", file.title)}
                    disabled={processingId === file.id}
                    className="btn btn-success btn-sm"
                  >
                    {processingId === file.id ? <div className="spinner spinner-sm" /> : 'Aprobar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import {
  Star, FileText, Shield, Trophy, Clock, Swap,
  SignOut, CalendarBlank, GraduationCap, Pencil,
  WarningCircle, CheckCircle, Image as ImageIcon,
  At
} from "@phosphor-icons/react"
import GuestRestricted from "../../components/GuestRestricted"

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userData, setUserData] = useState(null)
  const [showChangeCareer, setShowChangeCareer] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  
  const [nicknameInput, setNicknameInput] = useState("")
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [savingNickname, setSavingNickname] = useState(false)
  
  const fileInputRef = useRef(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deletingImage, setDeletingImage] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    if (status === "authenticated") {
      fetch("/api/user/me")
        .then(res => res.json())
        .then(data => {
          setUserData(data)
          setNicknameInput(data.nickname || "")
        })
        .catch(err => console.error("Error cargando perfil:", err))
    }
  }, [status, router])

  if (session?.user?.role === 'GUEST') return <GuestRestricted />

  const handleChangeCareer = async () => {
    try {
      const res = await fetch("/api/user/change-career", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setToastMessage("Carrera reseteada. Recargando...")
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setToastMessage(data.error || "Error al cambiar carrera")
      }
    } catch {
      setToastMessage("Error de conexión")
    }
    setShowChangeCareer(false)
  }

  const handleSaveNickname = async () => {
    setSavingNickname(true)
    try {
      const res = await fetch("/api/user/nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nicknameInput.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setToastMessage("Apodo actualizado exitosamente")
        setUserData(prev => ({ ...prev, nickname: nicknameInput.trim(), nicknameLastChangedAt: new Date().toISOString() }))
        setIsEditingNickname(false)
      } else {
        setToastMessage(data.error || "Error al actualizar apodo")
      }
    } catch {
      setToastMessage("Error de conexión")
    } finally {
      setSavingNickname(false)
      setTimeout(() => setToastMessage(""), 4000)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      setToastMessage("Solo se admiten archivos .jpg y .png")
      setTimeout(() => setToastMessage(""), 4000)
      return
    }

    setUploadingImage(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 256
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height * (MAX_SIZE / width))
            width = MAX_SIZE
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width * (MAX_SIZE / height))
            height = MAX_SIZE
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

        try {
          const res = await fetch("/api/user/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: dataUrl })
          })
          const data = await res.json()
          if (res.ok) {
            setToastMessage("Foto de perfil actualizada. Recargando...")
            setTimeout(() => window.location.reload(), 1500)
          } else {
            setToastMessage(data.error || "Error al actualizar foto")
            setUploadingImage(false)
            setTimeout(() => setToastMessage(""), 4000)
          }
        } catch {
          setToastMessage("Error de conexión al subir la foto")
          setUploadingImage(false)
          setTimeout(() => setToastMessage(""), 4000)
        }
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteImage = async () => {
    setDeletingImage(true)
    try {
      const res = await fetch("/api/user/image", { method: "DELETE" })
      if (res.ok) {
        setToastMessage("Foto eliminada. Restaurando predeterminada...")
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const data = await res.json()
        setToastMessage(data.error || "Error al eliminar foto")
        setDeletingImage(false)
        setTimeout(() => setToastMessage(""), 4000)
      }
    } catch {
      setToastMessage("Error de conexión al eliminar la foto")
      setDeletingImage(false)
      setTimeout(() => setToastMessage(""), 4000)
    }
  }

  if (status === "loading" || !mounted) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner spinner-lg" /></div>
  }

  const karma = userData?.karma || 0
  const careerName = userData?.career?.name || 'Sin Carrera'
  const enrolledCount = userData?.enrolledCourses?.length || 0

  // Karma tier (Every 500 pts)
  const rankNames = ['Novato', 'Intermedio', 'Avanzado', 'Experto', 'Maestro', 'Gran Maestro']
  const rankColors = ['var(--text-muted)', 'oklch(65% 0.12 60)', 'oklch(72% 0.04 240)', 'var(--karma)', 'var(--brand)', 'var(--success)']
  
  const rankIndex = Math.min(Math.floor(karma / 500), rankNames.length - 1)
  const tierName = rankNames[rankIndex]
  const tierColor = rankColors[rankIndex]
  const nextTierName = rankIndex < rankNames.length - 1 ? rankNames[rankIndex + 1] : 'Rango Máximo'
  
  const progressPercentage = rankIndex === rankNames.length - 1 ? 100 : ((karma % 500) / 500) * 100
  const pointsToNext = rankIndex === rankNames.length - 1 ? 0 : 500 - (karma % 500)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Toast */}
      {toastMessage && (
        <div className="toast toast-success">
          <CheckCircle size={18} weight="fill" style={{ flexShrink: 0 }} />
          <p>{toastMessage}</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-8)', marginBottom: 'var(--space-6)' }}>
        <img
          src={session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop"}
          alt={`Avatar de ${session?.user?.name || 'Estudiante'}`}
          style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--brand)', margin: '0 auto var(--space-5)', objectFit: 'cover' }}
        />
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          {session?.user?.name || 'Estudiante UDP'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
          {session?.user?.email}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span className="badge badge-brand"><GraduationCap size={14} weight="fill" /> {careerName}</span>
          <span className="badge badge-karma"><Star size={14} weight="fill" /> {karma} Karma · {tierName}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="profile-stats-grid">
        <div className="stat-card" style={{ textAlign: 'center', alignItems: 'center' }}>
          <Star size={22} weight="fill" color="var(--karma)" />
          <p className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>{karma}</p>
          <p className="stat-label">Karma</p>
        </div>
        <div className="stat-card" style={{ textAlign: 'center', alignItems: 'center' }}>
          <FileText size={22} weight="fill" color="var(--brand)" />
          <p className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>0</p>
          <p className="stat-label">Subidos</p>
        </div>
        <div className="stat-card" style={{ textAlign: 'center', alignItems: 'center' }}>
          <Shield size={22} weight="fill" color="var(--success)" />
          <p className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>0</p>
          <p className="stat-label">Moderados</p>
        </div>
        <div className="stat-card" style={{ textAlign: 'center', alignItems: 'center' }}>
          <GraduationCap size={22} weight="fill" color="var(--info)" />
          <p className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>{enrolledCount}</p>
          <p className="stat-label">Ramos</p>
        </div>
      </div>

      <style>{`
        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        @media (max-width: 768px) {
          .profile-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      {/* Karma Progress */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-base)', fontWeight: 700 }}>
            <Trophy size={18} weight="fill" color={tierColor} /> Progresión de Rango
          </h3>
          <span className="badge badge-karma">{tierName}</span>
        </div>
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', height: 8, overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
          <div style={{
            height: '100%',
            width: `${progressPercentage}%`,
            background: 'var(--karma)',
            borderRadius: 'var(--radius-pill)',
            transition: 'width 0.5s var(--ease-out)'
          }} />
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {pointsToNext > 0 ? `${pointsToNext} puntos para alcanzar el rango ${nextTierName}` : '¡Has alcanzado el rango máximo en la plataforma!'}
        </p>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Clock size={18} weight="fill" color="var(--brand)" /> Historial de Contribuciones
        </h3>
        <div className="empty-state" style={{ padding: 'var(--space-8) var(--space-6)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Aún no tienes contribuciones registradas.</p>
          <button onClick={() => router.push('/dashboard/subir')} className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-4)' }}>
            Subir tu primer apunte
          </button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Pencil size={18} weight="fill" color="var(--text-secondary)" /> Configuración
        </h3>

        <div style={{ padding: 'var(--space-4)', background: 'var(--surface-1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Apodo de Chat</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Visible en el foro. Cooldown de 5 días.</p>
            </div>
            {!isEditingNickname && (
              <button onClick={() => setIsEditingNickname(true)} className="btn btn-secondary btn-sm">Editar</button>
            )}
          </div>
          
          {isEditingNickname ? (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input 
                type="text" 
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="Tu apodo"
                className="input"
                maxLength={20}
                style={{ flex: 1 }}
              />
              <button onClick={handleSaveNickname} disabled={savingNickname} className="btn btn-primary btn-sm">
                {savingNickname ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setIsEditingNickname(false)} disabled={savingNickname} className="btn btn-secondary btn-sm">
                Cancelar
              </button>
            </div>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--surface-0)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: userData?.nickname ? 'var(--text-primary)' : 'var(--text-muted)',
              minWidth: '160px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center' }}>
                <At size={16} weight="bold" />
              </span>
              <span style={{ fontStyle: userData?.nickname ? 'normal' : 'italic' }}>
                {userData?.nickname || "No tienes un apodo configurado"}
              </span>
            </div>
          )}
        </div>

        {/* Change Profile Picture Block */}
        <div style={{ padding: 'var(--space-4)', background: 'var(--surface-1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Foto de Perfil</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Solo archivos .jpg o .png (Máx. 5 MB antes de comprimir).</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".jpg,.jpeg,.png" 
              onChange={handleImageUpload} 
            />
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button 
                onClick={handleDeleteImage} 
                disabled={deletingImage || uploadingImage} 
                className="btn btn-secondary btn-sm"
              >
                {deletingImage ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploadingImage || deletingImage} 
                className="btn btn-primary btn-sm"
              >
                {uploadingImage ? <div className="spinner spinner-sm" /> : 'Cambiar Foto'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <button
            onClick={() => setShowChangeCareer(true)}
            className="btn btn-secondary btn-full"
            style={{ justifyContent: 'flex-start' }}
          >
            <Swap size={18} color="var(--warning)" /> Cambiar de Carrera
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Cooldown 30 días</span>
          </button>

          <button
            onClick={() => signOut()}
            className="btn btn-danger btn-full"
            style={{ justifyContent: 'flex-start' }}
          >
            <SignOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Change Career Confirm Modal */}
      {showChangeCareer && (
        <div className="modal-backdrop">
          <div className="modal">
            <div style={{ textAlign: 'center' }}>
              <WarningCircle size={40} weight="fill" color="var(--warning)" style={{ marginBottom: 'var(--space-4)' }} />
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>Cambiar de Carrera</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', maxWidth: '40ch', margin: '0 auto' }}>
                Esta acción tiene un cooldown de 30 días. Se resetearán tus ramos inscritos.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button onClick={() => setShowChangeCareer(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={handleChangeCareer} className="btn btn-danger" style={{ flex: 1 }}>Confirmar Cambio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
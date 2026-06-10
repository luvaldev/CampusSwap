'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, FolderOpen, Search, UploadCloud,
  Star, LogOut, Bell, ChevronRight, FileText,
  Users, TrendingUp, Shield, BookOpen, Clock,
  CheckCircle, AlertCircle, PlusCircle, Archive, GraduationCap
} from "lucide-react"

// Importamos nuestra Base de Datos Dinámica
import { carrerasDB, cursosDB } from "../data/database"

/* ─── Sub-components ─────────────────────────────── */

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

function SubjectCard({ curso, router, onToggleEstado }) {
  // Asignamos un color en base a un hash simple del ID para que luzca colorido como en el diseño
  const colors = [
    { c: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
    { c: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
    { c: '#059669', bg: 'rgba(5,150,105,0.12)' },
    { c: '#d97706', bg: 'rgba(217,119,6,0.12)' }
  ];
  const colorTheme = colors[curso.id.length % colors.length];

  return (
    <div 
      onClick={() => router.push(`/dashboard/curso/${curso.id}`)}
      style={{
        background: 'rgba(26,22,64,0.5)',
        border: '1px solid rgba(139,92,246,0.12)',
        borderRadius: '16px',
        padding: '22px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = colorTheme.c + '55'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 8px 30px ${colorTheme.c}18`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: colorTheme.c, borderRadius: '16px 16px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: colorTheme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen style={{ width: '20px', height: '20px', color: colorTheme.c }} />
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleEstado(curso.id); }}
          style={{ background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#f87171', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}
        >
          <Archive style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', color: colorTheme.c, fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
          {curso.id.toUpperCase()}
        </p>
        <h3 style={{ fontSize: '16px', fontWeight: '600', fontFamily: "'Syne', sans-serif", color: '#f0ecff', lineHeight: 1.3, marginBottom: '4px' }}>
          {curso.nombre}
        </h3>
        <p style={{ fontSize: '12px', color: '#5c527a' }}>{curso.creditos} Créditos</p>
      </div>
    </div>
  )
}


/* ─── Main Dashboard ─────────────────────────────── */
export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // ESTADOS DEL USUARIO
  const [userCareer, setUserCareer] = useState(null)
  const [misRamos, setMisRamos] = useState([]) 
  
  // ESTADOS DE LA UI
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [selectedCareerId, setSelectedCareerId] = useState("")
  const [cooldownError, setCooldownError] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // CARGA INICIAL
  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    
    if (status === "authenticated") {
      const savedCareerId = localStorage.getItem("userCareerId")
      const savedRamos = JSON.parse(localStorage.getItem("userRamos")) || []
      
      if (savedCareerId) {
        const careerObj = carrerasDB.find(c => c.id === savedCareerId)
        setUserCareer(careerObj)
        setMisRamos(savedRamos)
      } else {
        setShowOnboarding(true)
      }
    }
  }, [status, router])

  const handleSaveCareer = () => {
    if (!selectedCareerId) return

    const lastChanged = localStorage.getItem("careerLastChanged")
    const now = new Date().getTime()
    const TWO_MONTHS_MS = 5184000000

    if (lastChanged && now - parseInt(lastChanged) < TWO_MONTHS_MS) {
      const daysLeft = Math.ceil((TWO_MONTHS_MS - (now - parseInt(lastChanged))) / (1000 * 60 * 60 * 24))
      setCooldownError(`Solo puedes cambiar tu carrera una vez cada 2 meses. Faltan ${daysLeft} días.`)
      return
    }

    const careerObj = carrerasDB.find(c => c.id === selectedCareerId)
    localStorage.setItem("userCareerId", selectedCareerId)
    localStorage.setItem("careerLastChanged", now.toString())
    localStorage.setItem("userRamos", JSON.stringify([])) 
    
    setUserCareer(careerObj)
    setMisRamos([])
    setShowOnboarding(false)
    setCooldownError("")
  }

  const agregarRamo = (cursoId) => {
    const nuevosRamos = [...misRamos, { id: cursoId, estado: 'actual' }]
    setMisRamos(nuevosRamos)
    localStorage.setItem("userRamos", JSON.stringify(nuevosRamos))
    setShowAddModal(false)
  }

  const toggleCursoEstado = (cursoId) => {
    const nuevosRamos = misRamos.map(ramo => {
      if (ramo.id === cursoId) {
        return { ...ramo, estado: ramo.estado === 'actual' ? 'archivado' : 'actual' }
      }
      return ramo
    })
    setMisRamos(nuevosRamos)
    localStorage.setItem("userRamos", JSON.stringify(nuevosRamos))
  }

  const ramosCompletos = misRamos.map(mr => {
    const cursoData = cursosDB.find(c => c.id === mr.id)
    return { ...cursoData, estado: mr.estado }
  }).filter(c => c.nombre !== undefined)

  const cursosActuales = ramosCompletos.filter(c => c.estado === 'actual')
  const cursosArchivados = ramosCompletos.filter(c => c.estado === 'archivado')

  const cursosDisponibles = userCareer 
    ? cursosDB.filter(c => c.carreras.includes(userCareer.id) && !misRamos.some(mr => mr.id === c.id))
    : []

  if (status === "loading" || !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#060410' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid rgba(139,92,246,0.2)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (status === "unauthenticated") return null

  const firstName = session?.user?.name?.split(' ')[0] || 'Estudiante'

  return (
    <>
      {/* --- MODAL ONBOARDING --- */}
      {showOnboarding && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(26,22,64,0.95) 0%, rgba(18,16,42,0.98) 100%)', border: '1px solid rgba(139,92,246,0.3)', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 4px 60px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#bb86fc', marginBottom: '16px', fontFamily: "'Syne', sans-serif" }}>Bienvenido a CampusSwap</h2>
            <p style={{ color: '#8892b0', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 }}>Para personalizar tu catálogo de ramos, selecciona tu carrera. <strong style={{ color: '#fbbf24' }}>Atención: Solo podrás hacer un cambio cada 2 meses.</strong></p>
            
            <select 
              style={{ width: '100%', background: '#060410', border: '1px solid rgba(139,92,246,0.3)', color: '#f0ecff', borderRadius: '10px', padding: '12px', marginBottom: '16px', outline: 'none' }}
              value={selectedCareerId}
              onChange={(e) => setSelectedCareerId(e.target.value)}
            >
              <option value="" disabled>Selecciona tu carrera...</option>
              {carrerasDB.map(carrera => (
                <option key={carrera.id} value={carrera.id}>{carrera.nombre}</option>
              ))}
            </select>

            {cooldownError && <p style={{ color: '#fca5a5', fontSize: '13px', marginBottom: '16px', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>{cooldownError}</p>}

            <button onClick={handleSaveCareer} style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontWeight: 'bold', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
              Guardar y Continuar
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL ADD RAMO --- */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'rgba(18,16,42,0.98)', border: '1px solid rgba(139,92,246,0.2)', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f0ecff', fontFamily: "'Syne', sans-serif" }}>Añadir Ramo a mi Catálogo</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
              {cursosDisponibles.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#5c527a', padding: '32px 0' }}>Ya tienes todos los ramos de tu malla inscritos.</p>
              ) : (
                cursosDisponibles.map(curso => (
                  <div key={curso.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(26,22,64,0.5)', border: '1px solid rgba(139,92,246,0.1)', padding: '16px', borderRadius: '12px' }}>
                    <div>
                      <h4 style={{ color: '#f0ecff', fontWeight: 'bold', fontSize: '15px' }}>{curso.nombre}</h4>
                      <p style={{ color: '#8892b0', fontSize: '12px', marginTop: '4px' }}>{curso.creditos} Créditos Académicos</p>
                    </div>
                    <button onClick={() => agregarRamo(curso.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(124,58,237,0.15)', color: '#a78bfa', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.3)', cursor: 'pointer', fontSize: '13px' }}>
                      <PlusCircle style={{ width: '14px', height: '14px' }} /> Inscribir
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', width: '100%' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#5c527a', marginBottom: '4px', fontWeight: '300' }}>Bienvenido de vuelta</p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '30px', fontWeight: '800', color: '#f0ecff', letterSpacing: '-0.5px', lineHeight: 1 }}>{firstName} <p style={{ fontSize: '20px', color: '#a78bfa', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', padding: '2px 4px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                {userCareer?.tag || 'Configurando'}
              </p>
            </h1>
          </div>

          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
            <PlusCircle style={{ width: '16px', height: '16px' }} /> Añadir Ramo
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '32px' }}>
          <StatCard icon={FolderOpen} label="Ramos activos" value={cursosActuales.length.toString()} color="#7c3aed" />
          <StatCard icon={Archive} label="Ramos archivados" value={cursosArchivados.length.toString()} color="#0891b2" />
          <StatCard icon={Star} label="Karma acumulado" value="150" sub="Listo para canjear" color="#fbbf24" />
          <StatCard icon={Users} label="Comunidad UDP" value="1.2K" sub="Estudiantes activos" color="#10b981" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
          
          {/* Left — Subjects */}
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '700', color: '#f0ecff', marginBottom: '16px' }}>Mis Ramos</h2>
            
            {cursosActuales.length === 0 ? (
              <div style={{ border: '1px dashed rgba(139,92,246,0.3)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                <GraduationCap style={{ width: '40px', height: '40px', color: '#5c527a', margin: '0 auto 12px' }} />
                <p style={{ color: '#f0ecff', fontWeight: 'bold' }}>Aún no tienes ramos inscritos</p>
                <p style={{ color: '#8892b0', fontSize: '13px' }}>Haz clic en "Añadir Ramo" en la esquina superior derecha.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {cursosActuales.map(c => <SubjectCard key={c.id} curso={c} router={router} onToggleEstado={toggleCursoEstado} />)}
              </div>
            )}

            {cursosArchivados.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                 <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: '700', color: '#8892b0', marginBottom: '16px' }}>Archivados</h2>
                 <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {cursosArchivados.map(curso => (
                      <div key={curso.id} onClick={() => toggleCursoEstado(curso.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(26,22,64,0.3)', border: '1px solid rgba(139,92,246,0.1)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>
                        <Archive style={{ width: '14px', height: '14px', color: '#8892b0' }} />
                        <span style={{ fontSize: '13px', color: '#ccd6f6' }}>{curso.nombre}</span>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Shield style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fcd34d', fontFamily: "'Syne', sans-serif" }}>Sistema de Cuarentena</h3>
              </div>
              <p style={{ fontSize: '12px', color: '#fde68a', lineHeight: 1.6 }}>Tienes <strong style={{ color: '#fbbf24' }}>3 archivos</strong> pendientes de moderación por la comunidad. Revisar y aprobar material te otorga <strong style={{ color: '#fbbf24' }}>+10 Karma</strong>.</p>
              <button onClick={() => router.push('/dashboard/moderacion')} style={{ marginTop: '14px', width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                Ir a moderar →
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
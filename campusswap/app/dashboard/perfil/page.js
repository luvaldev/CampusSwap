'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Star, Bell, Shield, BookOpen, GraduationCap, ChevronRight,
  Users, FileText, Activity, Clock, BookMarked, Plus
} from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [data, setData] = useState(null)
  const [facultades, setFacultades] = useState([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  
  // Estados para formularios
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [selectedCourses, setSelectedCourses] = useState([]) // Array de IDs de ramos
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      // Cargar resumen
      fetch("/api/dashboard/summary")
        .then(res => res.json())
        .then(d => {
          setData(d)
          if (d.user && !d.user.careerId) setShowOnboarding(true)
          if (d.user?.enrolledCourses) {
            setSelectedCourses(d.user.enrolledCourses.map(c => c.id))
          }
        })
      // Cargar facultades (por si necesita onboarding)
      fetch("/api/faculties").then(res => res.json()).then(f => setFacultades(f))
    }
  }, [session])

  // --- FUNCIONES DE GUARDADO ---
  const handleSaveCareer = async () => {
    if (!selectedCareer) return
    setIsSaving(true)
    const res = await fetch("/api/user/onboarding", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ careerId: selectedCareer.id }),
    })
    if (res.ok) window.location.reload()
    setIsSaving(false)
  }

  const handleSaveCourses = async () => {
    setIsSaving(true)
    const res = await fetch("/api/user/enroll", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseIds: selectedCourses }),
    })
    if (res.ok) {
      setShowEnrollModal(false)
      window.location.reload()
    }
    setIsSaving(false)
  }

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    )
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER: Carga instantáneo con datos de sesión */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#fff', marginBottom: '4px', fontFamily: "'Syne', sans-serif" }}>
            ¡Hola, {session?.user?.name?.split(" ")[0] || "Estudiante"}!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            {data?.user?.career?.name || "Cargando tu información..."}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Bell style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
          </div>
          <img src={session?.user?.image} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #8b5cf6' }} />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '28px', width: '100%', alignItems: 'start' }}>
        
        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* MÉTRICAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ background: 'rgba(26,22,64,0.4)', border: '1px solid rgba(139,92,246,0.15)', padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Star style={{ color: '#fbbf24', width: '20px', height: '20px' }} />
                <h4 style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Mis Karma Points</h4>
              </div>
              <p style={{ color: '#fff', fontSize: '26px', fontWeight: '700', margin: 0 }}>
                {data ? data.user?.karma : "..."} <span style={{ fontSize: '14px', color: '#a78bfa', fontWeight: '400' }}>pts</span>
              </p>
            </div>

            <div style={{ background: 'rgba(26,22,64,0.4)', border: '1px solid rgba(139,92,246,0.15)', padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Users style={{ color: '#3b82f6', width: '20px', height: '20px' }} />
                <h4 style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Comunidad</h4>
              </div>
              <p style={{ color: '#fff', fontSize: '26px', fontWeight: '700', margin: 0 }}>
                {data ? data.stats?.totalUsers : "..."} <span style={{ fontSize: '14px', color: '#60a5fa', fontWeight: '400' }}>alumnos</span>
              </p>
            </div>

            <div style={{ background: 'rgba(26,22,64,0.4)', border: '1px solid rgba(139,92,246,0.15)', padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <FileText style={{ color: '#10b981', width: '20px', height: '20px' }} />
                <h4 style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Biblioteca</h4>
              </div>
              <p style={{ color: '#fff', fontSize: '26px', fontWeight: '700', margin: 0 }}>
                {data ? data.stats?.totalDocs : "..."} <span style={{ fontSize: '14px', color: '#34d399', fontWeight: '400' }}>apuntes</span>
              </p>
            </div>
          </div>

          {/* RAMOS INSCRITOS */}
          <div style={{ background: 'rgba(20,16,47,0.4)', border: '1px solid rgba(139,92,246,0.08)', padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookMarked style={{ width: '20px', height: '20px', color: '#c084fc' }} />
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', margin: 0 }}>Mis Asignaturas Inscritas</h3>
              </div>
              <button 
                onClick={() => setShowEnrollModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Plus style={{ width: '14px', height: '14px' }} /> Gestionar
              </button>
            </div>
            
            {!data ? (
               <p style={{ color: '#64748b', fontSize: '14px' }}>Cargando asignaturas...</p>
            ) : data.user?.enrolledCourses?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {data.user.enrolledCourses.map((ramo) => (
                  <div key={ramo.id} onClick={() => router.push(`/dashboard/curso/${ramo.id}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                    <div>
                      <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '500', margin: '0 0 4px 0' }}>{ramo.name}</p>
                      <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '600' }}>{ramo.id} • {ramo.credits} Créditos</span>
                    </div>
                    <ChevronRight style={{ width: '16px', height: '16px', color: '#475569' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>No tienes asignaturas inscritas este semestre.</p>
                <button onClick={() => setShowEnrollModal(true)} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Inscribir Ramos Ahora</button>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Shield style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fcd34d', margin: 0 }}>Sistema de Cuarentena</h3>
            </div>
            <p style={{ fontSize: '12px', color: '#fde68a', lineHeight: 1.6, margin: '0 0 14px 0' }}>
              Asegura la calidad académica revisando apuntes. Obtén <strong style={{ color: '#fff' }}>+10 Karma</strong> por moderación.
            </p>
            <button onClick={() => router.push('/dashboard/moderacion')} style={{ width: '100%', padding: '9px', borderRadius: '8px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', color: '#fef08a', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              Panel de Moderación
            </button>
          </div>

          <div style={{ background: 'rgba(13,8,32,0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Activity style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>Actividad Reciente</h3>
            </div>
            
            {!data ? (
               <p style={{ color: '#64748b', fontSize: '12px' }}>Buscando actividad...</p>
            ) : data.recentActivity?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {data.recentActivity.map((act) => (
                  <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                    <div style={{ background: 'rgba(139,92,246,0.1)', padding: '6px', borderRadius: '8px', color: '#a78bfa', marginTop: '2px' }}><Clock style={{ width: '12px', height: '12px' }} /></div>
                    <div>
                      <p style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: '500', margin: '0 0 2px 0' }}>{act.text}</p>
                      <span style={{ color: '#64748b', fontSize: '10px' }}>{act.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>Aún no hay actividad reciente en la plataforma.</p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: ONBOARDING (Elegir Carrera) */}
      {showOnboarding && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3, 2, 9, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ width: '100%', maxWidth: '480px', background: '#0b081e', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '24px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '22px', color: '#fff', textAlign: 'center' }}>Bienvenido a CampusSwap</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>Selecciona tu facultad y carrera para continuar.</p>
            
            <select onChange={(e) => { const fac = facultades.find(f => f.id === e.target.value); setSelectedFaculty(fac); setSelectedCareer(null); }} style={{ padding: '12px', background: '#110d2c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff' }}>
              <option value="">-- Facultad --</option>
              {facultades.map(fac => <option key={fac.id} value={fac.id}>{fac.name}</option>)}
            </select>

            {selectedFaculty && (
              <select onChange={(e) => setSelectedCareer(selectedFaculty.careers.find(c => c.id === e.target.value))} style={{ padding: '12px', background: '#110d2c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff' }}>
                <option value="">-- Carrera --</option>
                {selectedFaculty.careers.map(car => <option key={car.id} value={car.id}>{car.name}</option>)}
              </select>
            )}

            <button onClick={handleSaveCareer} disabled={!selectedCareer || isSaving} style={{ padding: '14px', background: selectedCareer ? '#7c3aed' : '#333', color: '#fff', borderRadius: '10px', border: 'none', cursor: selectedCareer ? 'pointer' : 'not-allowed' }}>
              {isSaving ? "Guardando..." : "Comenzar"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: GESTIÓN DE RAMOS (Inscripción) */}
      {showEnrollModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3, 2, 9, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ width: '100%', maxWidth: '600px', background: '#0b081e', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '24px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '80vh' }}>
            <h2 style={{ fontSize: '20px', color: '#fff' }}>Inscribe tus Asignaturas</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Selecciona los ramos que estás cursando actualmente. Puedes modificarlos el próximo semestre.</p>
            
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '10px' }}>
              {data?.user?.career?.courses?.map(course => (
                <label key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', cursor: 'pointer', border: selectedCourses.includes(course.id) ? '1px solid #7c3aed' : '1px solid transparent' }}>
                  <input type="checkbox" checked={selectedCourses.includes(course.id)} onChange={() => toggleCourse(course.id)} style={{ accentColor: '#7c3aed', width: '18px', height: '18px' }} />
                  <div>
                    <p style={{ color: '#fff', fontSize: '14px', margin: 0 }}>{course.name}</p>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>{course.id}</span>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button onClick={() => setShowEnrollModal(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSaveCourses} disabled={isSaving} style={{ flex: 1, padding: '12px', background: '#7c3aed', border: 'none', color: '#fff', borderRadius: '10px', cursor: 'pointer' }}>{isSaving ? "Guardando..." : "Guardar Ramos"}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Star, Bell, Shield, BookOpen, GraduationCap, CaretRight,
  Users, FileText, Lightning, Clock, BookBookmark, Plus,
  MagnifyingGlass, CheckCircle, WarningCircle
} from "@phosphor-icons/react"
import CustomSelect from "../components/CustomSelect"

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [data, setData] = useState(null)
  const [facultades, setFacultades] = useState([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [selectedCourses, setSelectedCourses] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [courseSearch, setCourseSearch] = useState("")

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const [careerCourses, setCareerCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  useEffect(() => {
    if (session?.user?.role === 'GUEST') {
      router.replace('/dashboard/explorar')
      return
    }
    if (session?.user) {
      fetch("/api/dashboard/summary")
        .then(res => res.json())
        .then(d => {
          setData(d)
          if (d.user && !d.user.careerId && session?.user?.role !== 'GUEST') {
            setShowOnboarding(true)
            fetch("/api/faculties").then(res => res.json()).then(f => setFacultades(f))
          }
          if (d.user?.enrolledCourses) {
            setSelectedCourses(d.user.enrolledCourses.map(c => c.id))
          }
        })
      fetch("/api/notifications")
        .then(res => res.json())
        .then(n => {
          if (n.notifications) {
            setNotifications(n.notifications)
            setUnreadCount(n.unreadCount)
          }
        })
    }
  }, [session])

  useEffect(() => {
    if (showEnrollModal && data?.user?.careerId && careerCourses.length === 0) {
      setLoadingCourses(true)
      fetch("/api/user/career-courses")
        .then(res => res.json())
        .then(courses => {
          setCareerCourses(courses)
          setLoadingCourses(false)
        })
        .catch(err => {
          console.error("Error al cargar materias:", err)
          setLoadingCourses(false)
        })
    }
  }, [showEnrollModal, data?.user?.careerId, careerCourses.length])

  const handleSaveCareer = async () => {
    if (!selectedCareer) return
    setIsSaving(true)
    const res = await fetch("/api/user/onboarding", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ careerId: selectedCareer.id }),
    })
    if (res.ok) {
      setShowOnboarding(false)
      const summaryRes = await fetch("/api/dashboard/summary")
      if (summaryRes.ok) {
        const d = await summaryRes.json()
        setData(d)
        if (d.user?.enrolledCourses) {
          setSelectedCourses(d.user.enrolledCourses.map(c => c.id))
        }
      }
    }
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
      const summaryRes = await fetch("/api/dashboard/summary")
      if (summaryRes.ok) {
        const d = await summaryRes.json()
        setData(d)
        if (d.user?.enrolledCourses) {
          setSelectedCourses(d.user.enrolledCourses.map(c => c.id))
        }
      }
    }
    setIsSaving(false)
  }

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    )
  }

  const handleMarkAsRead = async (id = null) => {
    const body = id ? { notificationIds: [id] } : { markAll: true }
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    
    if (id) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    }
  }

  const normalizeText = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

  const filteredCourses = careerCourses.filter(c => 
    normalizeText(c.name).includes(normalizeText(courseSearch)) || 
    normalizeText(c.id).includes(normalizeText(courseSearch))
  )

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <header className="page-header">
        <div>
          <h1 className="page-title">
            ¡Hola, {session?.user?.name ? session.user.name.split(" ")[0].charAt(0).toUpperCase() + session.user.name.split(" ")[0].slice(1).toLowerCase() : "Estudiante"}!
          </h1>
          <p className="page-subtitle">
            {data?.user?.career?.name || "Cargando tu información..."}
          </p>
        </div>
        <div className="header-actions-mobile hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ background: 'var(--surface-2)', padding: 'var(--space-3)', borderRadius: '50%', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
            >
              <Bell size={18} color="var(--text-secondary)" />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--brand)', color: 'var(--text-on-brand)', fontSize: '10px', fontWeight: 'bold', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 'var(--space-2)', background: 'var(--surface-0)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', width: 320, maxWidth: 'calc(100vw - var(--space-8))', zIndex: 'var(--z-dropdown)', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Notificaciones</span>
                  {unreadCount > 0 && (
                    <button onClick={() => handleMarkAsRead()} style={{ fontSize: 'var(--text-xs)', color: 'var(--brand)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      Marcar todo como leído
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                      No tienes notificaciones
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                        style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-subtle)', background: n.isRead ? 'transparent' : 'var(--surface-1)', cursor: n.isRead ? 'default' : 'pointer', transition: 'background var(--duration-fast)' }}
                      >
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: n.isRead ? 400 : 600, marginBottom: '4px' }}>{n.title}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => router.push('/dashboard/perfil')}
            style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <img
              src={session?.user?.image}
              alt={`Avatar de ${session?.user?.name || 'Estudiante'}`}
              style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--brand)', objectFit: 'cover' }}
            />
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

          {/* METRICS */}
          <div className="metrics-grid">
            <div className="stat-card">
              <div className="icon-box icon-box-md" style={{ background: 'var(--karma-subtle)' }}>
                <Star size={20} weight="fill" color="var(--karma)" />
              </div>
              <div>
                <p className="stat-value">
                  {data ? data.user?.karma : "..."} <span className="stat-unit">pts</span>
                </p>
                <p className="stat-label">Mis Karma Points</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="icon-box icon-box-md" style={{ background: 'var(--info-subtle)' }}>
                <Users size={20} weight="fill" color="var(--info)" />
              </div>
              <div>
                <p className="stat-value">
                  {data ? data.stats?.totalUsers : "..."} <span className="stat-unit">alumnos</span>
                </p>
                <p className="stat-label">Comunidad</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="icon-box icon-box-md" style={{ background: 'var(--success-subtle)' }}>
                <FileText size={20} weight="fill" color="var(--success)" />
              </div>
              <div>
                <p className="stat-value">
                  {data ? data.stats?.totalDocs : "..."} <span className="stat-unit">apuntes</span>
                </p>
                <p className="stat-label">Biblioteca</p>
              </div>
            </div>
          </div>

          {/* ENROLLED COURSES */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <BookBookmark size={20} weight="fill" color="var(--brand)" />
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Mis Asignaturas Inscritas</h3>
              </div>
              <button onClick={() => setShowEnrollModal(true)} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Gestionar
              </button>
            </div>

            {!data ? (
              <div className="courses-grid">
                {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 'var(--radius-lg)' }} />)}
              </div>
            ) : data.user?.enrolledCourses?.length > 0 ? (
              <div className="courses-grid">
                {data.user.enrolledCourses.map((ramo) => (
                  <div
                    key={ramo.id}
                    onClick={() => router.push(`/dashboard/curso/${ramo.id}`)}
                    className="card card-interactive"
                    style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '4px' }}>{ramo.name}</p>
                      <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                        {ramo.id} · {ramo.credits} Créditos
                      </span>
                    </div>
                    <CaretRight size={16} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                  No tienes asignaturas inscritas este semestre.
                </p>
                <button onClick={() => setShowEnrollModal(true)} className="btn btn-primary">
                  Inscribir Ramos Ahora
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Quarantine card */}
          {session?.user?.role !== 'GUEST' && (
            <div className="card" style={{ background: 'var(--warning-subtle)', borderColor: 'var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <Shield size={18} weight="fill" color="var(--warning)" />
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Sistema de Cuarentena</h3>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                Asegura la calidad académica revisando apuntes. Obtén <strong style={{ color: 'var(--text-primary)' }}>+10 Karma</strong> por moderación.
              </p>
              <button onClick={() => router.push('/dashboard/moderacion')} className="btn btn-primary btn-sm btn-full">
                Panel de Moderación
              </button>
            </div>
          )}

          {/* Recent activity */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Lightning size={16} weight="fill" color="var(--brand)" />
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Actividad Reciente</h3>
            </div>

            {!data ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'start' }}>
                    <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 'var(--radius-md)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <div className="skeleton" style={{ height: 16, width: '80%' }} />
                      <div className="skeleton" style={{ height: 12, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : data.recentActivity?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {data.recentActivity.map((act) => (
                  <div key={act.id} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'start' }}>
                    <div className="icon-box icon-box-sm" style={{ background: 'var(--brand-wash)', marginTop: '2px' }}>
                      <Clock size={12} color="var(--brand)" />
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, marginBottom: '2px' }}>{act.text}</p>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{act.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>
                Aún no hay actividad reciente en la plataforma.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: ONBOARDING */}
      {showOnboarding && (
        <div className="modal-backdrop" style={{ backdropFilter: 'blur(8px)', background: 'oklch(0% 0 0 / 0.7)' }}>
          <div className="modal" style={{ maxWidth: 500, padding: 'var(--space-8)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <GraduationCap size={48} weight="fill" color="var(--brand)" style={{ margin: '0 auto var(--space-4)' }} />
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Bienvenido a CampusSwap</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
                Para personalizar tu experiencia y mostrarte los apuntes relevantes, necesitamos saber tu especialidad.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  ¿A qué facultad perteneces?
                </label>
                <CustomSelect
                  options={facultades.map(fac => ({ value: fac.id, label: fac.name }))}
                  value={selectedFaculty?.id || ""}
                  onChange={(val) => {
                    const fac = facultades.find(f => f.id === val);
                    setSelectedFaculty(fac);
                    setSelectedCareer(null);
                  }}
                  placeholder="Selecciona tu Facultad..."
                />
              </div>

              {selectedFaculty && (
                <div style={{ animation: 'fade-in 0.3s ease-out' }}>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>
                    ¿Cuál es tu carrera?
                  </label>
                  <CustomSelect
                    options={selectedFaculty.careers.map(car => ({ value: car.id, label: car.name }))}
                    value={selectedCareer?.id || ""}
                    onChange={(val) => setSelectedCareer(selectedFaculty.careers.find(c => c.id === val))}
                    placeholder="Selecciona tu Carrera..."
                  />
                </div>
              )}

              <button
                onClick={handleSaveCareer}
                disabled={!selectedCareer || isSaving}
                className="btn btn-primary btn-full"
                style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', fontSize: 'var(--text-base)' }}
              >
                {isSaving ? "Configurando tu perfil..." : "Comenzar mi viaje académico"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENROLL */}
      {showEnrollModal && (
        <div className="modal-backdrop" style={{ backdropFilter: 'blur(4px)', background: 'oklch(0% 0 0 / 0.5)' }}>
          <div className="modal modal-lg" style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
            <div style={{ padding: '0 0 var(--space-5)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Inscribe tus Asignaturas</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                Selecciona los ramos que estás cursando para añadirlos a tu dashboard rápido.
              </p>
            </div>

            <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
              <MagnifyingGlass size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Buscar por código o nombre del ramo..." 
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: 'var(--space-8)', width: '100%', background: 'var(--surface-1)' }}
              />
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingRight: 'var(--space-2)' }}>
              {loadingCourses ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-lg)' }} />
                ))
              ) : filteredCourses?.length === 0 ? (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No se encontraron asignaturas que coincidan con tu búsqueda.
                </div>
              ) : (
                filteredCourses?.map(course => (
                  <label
                    key={course.id}
                    onClick={() => toggleCourse(course.id)}
                    className="card card-interactive"
                    style={{
                      padding: 'var(--space-4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      cursor: 'pointer',
                      borderWidth: '2px',
                      borderColor: selectedCourses.includes(course.id) ? 'var(--brand)' : 'var(--border-subtle)',
                      background: selectedCourses.includes(course.id) ? 'color-mix(in oklch, var(--brand) 5%, transparent)' : 'var(--surface-0)',
                      transition: 'all var(--duration-fast)',
                    }}
                  >
                    <div style={{ 
                      width: 24, height: 24, borderRadius: 'var(--radius-sm)', 
                      border: `2px solid ${selectedCourses.includes(course.id) ? 'var(--brand)' : 'var(--border-default)'}`,
                      background: selectedCourses.includes(course.id) ? 'var(--brand)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {selectedCourses.includes(course.id) && <CheckCircle size={16} weight="bold" color="var(--text-on-brand)" />}
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>{course.name}</p>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: '4px' }}>
                        <span className="badge badge-neutral mono" style={{ fontSize: 'var(--text-xs)' }}>{course.id}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{course.credits} Créditos</span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setShowEnrollModal(false)} className="btn btn-secondary" style={{ flex: 1, padding: 'var(--space-4)' }}>
                Cancelar
              </button>
              <button onClick={handleSaveCourses} disabled={isSaving} className="btn btn-primary" style={{ flex: 1, padding: 'var(--space-4)' }}>
                {isSaving ? "Guardando..." : `Guardar Ramos (${selectedCourses.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-4);
          flex-wrap: wrap;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: var(--space-8);
          width: 100%;
          align-items: start;
        }
        .courses-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }
        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .courses-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
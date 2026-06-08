'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, Search, UploadCloud, Shield, LogOut,
  BookOpen, ChevronRight, ArrowLeft, Star,
  Building2, GraduationCap, FolderGit2, Compass, ArrowRight
} from "lucide-react"

// Importamos nuestra Base de Datos Dinámica
import { carrerasDB, cursosDB } from "../../data/database"

/* ─── Mock Data de Facultades UDP ────────────────────── */
const FACULTADES = [
  { id: 'fae', nombre: 'Facultad de Administración y Economía', color: '#10b981' },
  { id: 'fad', nombre: 'Facultad de Arquitectura, Arte y Diseño', color: '#f59e0b' },
  { id: 'fcs', nombre: 'Facultad de Ciencias Sociales y Humanidades', color: '#ec4899' },
  { id: 'fcl', nombre: 'Facultad de Comunicación y Letras', color: '#8b5cf6' },
  { id: 'fde', nombre: 'Facultad de Derecho', color: '#3b82f6' },
  { id: 'fed', nombre: 'Facultad de Educación', color: '#f43f5e' },
  { id: 'fic', nombre: 'Facultad de Ingeniería y Ciencias', color: '#7c3aed' }, // Aquí conectaremos la DB
  { id: 'fme', nombre: 'Facultad de Medicina', color: '#14b8a6' },
  { id: 'fps', nombre: 'Facultad de Psicología', color: '#06b6d4' },
  { id: 'fso', nombre: 'Facultad de Salud y Odontología', color: '#0ea5e9' }
];

/* ─── Subcomponente Barra de Navegación Lateral ──────────── */
function NavItem({ icon: Icon, label, active, badge, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
        background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
        border: active ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
        transition: 'all 0.15s',
        marginBottom: '2px'
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(139,92,246,0.07)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <Icon style={{ width: '17px', height: '17px', color: active ? '#a78bfa' : '#5c527a', flexShrink: 0 }} />
      <span style={{ fontSize: '14px', color: active ? '#d4bbff' : '#9b8fc4', fontWeight: active ? '500' : '400', flex: 1 }}>
        {label}
      </span>
      {badge && <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '20px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>{badge}</span>}
      {active && <ChevronRight style={{ width: '14px', height: '14px', color: '#a78bfa' }} />}
    </div>
  )
}

export default function Explorar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userCareer, setUserCareer] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // NIVELES DE NAVEGACIÓN
  const [selectedFacultad, setSelectedFacultad] = useState(null)
  const [selectedCarrera, setSelectedCarrera] = useState(null)

  useEffect(() => { setMounted(true) }, [])

  // Proteger ruta y cargar datos de usuario
  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    if (status === "authenticated") {
      const savedCareerId = localStorage.getItem("userCareerId")
      if (savedCareerId) {
        setUserCareer(carrerasDB.find(c => c.id === savedCareerId))
      }
    }
  }, [status, router])

  if (status === "loading" || !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#060410' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid rgba(139,92,246,0.2)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // FILTROS SEGÚN EL NIVEL DE NAVEGACIÓN
  const filteredFacultades = FACULTADES.filter(f => f.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  
  // Para la demo, solo la 'fic' tiene carreras mapeadas desde tu database.js
  const carrerasDeFacultad = selectedFacultad?.id === 'fic' ? carrerasDB : []
  const filteredCarreras = carrerasDeFacultad.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  const cursosDeCarrera = selectedCarrera ? cursosDB.filter(curso => curso.carreras.includes(selectedCarrera.id)) : []
  const filteredCursos = cursosDeCarrera.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#060410', overflow: 'hidden' }}>
      
      {/* ── Sidebar ── */}
      <aside style={{ width: '240px', flexShrink: 0, borderRight: '1px solid rgba(139,92,246,0.1)', background: 'rgba(13,8,32,0.6)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '4px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen style={{ width: '16px', height: '16px', color: 'white' }} />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '800', color: '#f0ecff', letterSpacing: '-0.3px' }}>CampusSwap</span>
        </div>

        <nav style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', color: '#5c527a', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 12px', marginBottom: '8px' }}>Principal</p>
          <NavItem icon={LayoutDashboard} label="Dashboard" onClick={() => router.push('/dashboard')} />
          <NavItem icon={Compass} label="Explorar" active />
          
          <p style={{ fontSize: '10px', color: '#5c527a', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 12px', margin: '20px 0 8px' }}>Acciones</p>
          <NavItem icon={UploadCloud} label="Subir Apunte" badge="S2" onClick={() => alert("Próximamente: Subir Apuntes")} />
          <NavItem icon={Shield} label="Moderar" onClick={() => router.push('/dashboard/moderacion')} />
        </nav>

        <div style={{ borderTop: '1px solid rgba(139,92,246,0.1)', paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px' }}>
            <img src={session?.user?.image} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(124,58,237,0.4)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#f0ecff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session?.user?.name}</p>
              <p style={{ fontSize: '10px', color: '#a78bfa', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', padding: '2px 4px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                {userCareer?.tag || 'Configurando'}
              </p>
            </div>
          </div>
          <button onClick={() => signOut()} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', padding: '8px', borderRadius: '8px', background: 'transparent', border: '1px solid transparent', cursor: 'pointer', color: '#5c527a', fontSize: '13px' }}>
            <LogOut style={{ width: '14px', height: '14px' }} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '32px 36px' }}>
        
        {/* Header y Buscador */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifycenter: 'space-between', marginBottom: '32px', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: '#5c527a', marginBottom: '4px', fontWeight: '300' }}>Explorar Directorio UDP</p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: '800', color: '#f0ecff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              {selectedCarrera ? selectedCarrera.nombre : selectedFacultad ? selectedFacultad.nombre : 'Todas las Facultades'}
            </h1>
            
            {/* Breadcrumbs */}
            {(selectedFacultad || selectedCarrera) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <button 
                  onClick={() => { setSelectedFacultad(null); setSelectedCarrera(null); setSearchTerm(""); }}
                  style={{ background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                   Facultades
                </button>
                <ChevronRight style={{ width: '14px', height: '14px', color: '#5c527a' }} />
                
                {selectedFacultad && (
                  <button 
                    onClick={() => { setSelectedCarrera(null); setSearchTerm(""); }}
                    style={{ background: 'transparent', border: 'none', color: selectedCarrera ? '#8892b0' : '#bb86fc', cursor: 'pointer', fontSize: '13px', fontWeight: selectedCarrera ? 'normal' : 'bold' }}
                  >
                     {selectedFacultad.id.toUpperCase()}
                  </button>
                )}
                
                {selectedCarrera && (
                  <>
                    <ChevronRight style={{ width: '14px', height: '14px', color: '#5c527a' }} />
                    <span style={{ color: '#bb86fc', fontSize: '13px', fontWeight: 'bold' }}>{selectedCarrera.tag}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Barra de Búsqueda */}
          <div style={{ width: '300px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(26,22,64,0.5)', border: '1px solid rgba(139,92,246,0.2)', padding: '10px 16px', borderRadius: '12px' }}>
            <Search style={{ width: '18px', height: '18px', color: '#a78bfa' }} />
            <input 
              type="text"
              placeholder={`Buscar ${selectedCarrera ? 'ramos' : selectedFacultad ? 'carreras' : 'facultades'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#f0ecff', fontSize: '14px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Contenedor de la Grilla Desplazable */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          
          {/* NIVEL 1: FACULTADES */}
          {!selectedFacultad && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredFacultades.map(fac => (
                <div 
                  key={fac.id}
                  onClick={() => { setSelectedFacultad(fac); setSearchTerm(""); }}
                  style={{ background: 'rgba(18,16,42,0.6)', border: `1px solid ${fac.color}30`, borderRadius: '16px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${fac.color}15`; e.currentTarget.style.borderColor = `${fac.color}60`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${fac.color}30`; }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: fac.color }} />
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${fac.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Building2 style={{ width: '24px', height: '24px', color: fac.color }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0ecff', lineHeight: 1.3, marginBottom: '8px', fontFamily: "'Syne', sans-serif" }}>{fac.nombre}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: fac.color, fontSize: '13px', fontWeight: '600' }}>
                    Explorar carreras <ArrowRight style={{ width: '14px', height: '14px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NIVEL 2: CARRERAS */}
          {selectedFacultad && !selectedCarrera && (
            <>
              {carrerasDeFacultad.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed rgba(139,92,246,0.2)', borderRadius: '16px' }}>
                  <Building2 style={{ width: '48px', height: '48px', color: '#5c527a', margin: '0 auto 16px' }} />
                  <p style={{ color: '#f0ecff', fontSize: '18px', fontWeight: 'bold' }}>Próximamente</p>
                  <p style={{ color: '#8892b0', marginTop: '8px' }}>Estamos indexando las carreras y ramos de esta facultad.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {filteredCarreras.map(carrera => (
                    <div 
                      key={carrera.id}
                      onClick={() => { setSelectedCarrera(carrera); setSearchTerm(""); }}
                      style={{ background: 'rgba(26,22,64,0.5)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '16px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#bb86fc'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)'; e.currentTarget.style.background = 'rgba(26,22,64,0.5)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <GraduationCap style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', background: 'rgba(255,255,255,0.05)', color: '#8892b0', padding: '4px 8px', borderRadius: '6px' }}>{carrera.tag}</span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#f0ecff', lineHeight: 1.3, marginBottom: '12px' }}>{carrera.nombre}</h3>
                      <p style={{ color: '#a78bfa', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Ver malla de ramos <ArrowRight style={{ width: '14px', height: '14px' }} />
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* NIVEL 3: RAMOS (CURSOS) */}
          {selectedCarrera && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredCursos.length === 0 ? (
                <p style={{ color: '#8892b0', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No se encontraron ramos con ese nombre.</p>
              ) : (
                filteredCursos.map(curso => (
                  <div 
                    key={curso.id}
                    onClick={() => router.push(`/dashboard/curso/${curso.id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(18,16,42,0.6)', border: '1px solid rgba(139,92,246,0.1)', padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.background = 'rgba(26,22,64,0.8)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.1)'; e.currentTarget.style.background = 'rgba(18,16,42,0.6)'; }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FolderGit2 style={{ width: '20px', height: '20px', color: '#bb86fc' }} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: '10px', color: '#a78bfa', fontWeight: 'bold', marginBottom: '2px' }}>{curso.id}</p>
                      <h4 style={{ color: '#f0ecff', fontWeight: '600', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{curso.nombre}</h4>
                      <p style={{ color: '#5c527a', fontSize: '12px', marginTop: '2px' }}>{curso.creditos} Créditos Académicos</p>
                    </div>
                    <ChevronRight style={{ width: '16px', height: '16px', color: '#5c527a' }} />
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
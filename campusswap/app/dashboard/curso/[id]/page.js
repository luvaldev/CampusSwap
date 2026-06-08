'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import {
  LayoutDashboard, Search, UploadCloud, Shield,
  Star, LogOut, BookOpen, ChevronRight, ArrowLeft,
  FileText, MessageSquare, Send, Download,
  CheckCircle, AlertCircle, Clock, Users
} from "lucide-react"

// Importamos la Base de Datos simulada
import { carrerasDB, cursosDB } from "../../../data/database"

/* ─── Mock Data para Archivos y Chat ────────────────────── */
const MOCK_FILES = [
  { id: 1, name: 'Resumen Solemne 1', type: 'PDF', size: '2.4 MB', uploader: 'Diego R.', status: 'verified', date: 'Hace 2 días' },
  { id: 2, name: 'Guía de Ejercicios Resueltos', type: 'PDF', size: '5.1 MB', uploader: 'Catalina M.', status: 'verified', date: 'Hace 1 semana' },
  { id: 3, name: 'Apuntes de Cátedra - Semana 4', type: 'DOCX', size: '1.2 MB', uploader: 'Tú', status: 'quarantine', date: 'Hace 3 horas' },
];

const INITIAL_CHAT = [
  { id: 1, user: 'Diego R.', avatar: 'D', text: '¿Alguien tiene la pauta del control sorpresa de ayer?', time: '10:30 AM', isMe: false },
  { id: 2, user: 'Catalina M.', avatar: 'C', text: 'La acabo de subir a la carpeta de apuntes, está en revisión.', time: '10:45 AM', isMe: false },
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
      <span style={{ fontSize: '14px', color: active ? '#d4bbff' : '#9b8fc4', fontWeight: active ? '500' : '400', flex: 1 }}>{label}</span>
      {badge && <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '20px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>{badge}</span>}
      {active && <ChevronRight style={{ width: '14px', height: '14px', color: '#a78bfa' }} />}
    </div>
  )
}

export default function CursoDetalle() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const chatEndRef = useRef(null)

  const [mounted, setMounted] = useState(false)
  const [userCareer, setUserCareer] = useState(null)
  const [curso, setCurso] = useState(null)
  
  // ESTADOS DEL CHAT
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT)
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => { setMounted(true) }, [])

  // Proteger ruta y cargar datos
  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    
    if (status === "authenticated" && params?.id) {
      // Decodificar el ID (puede venir como 'isw' o el nombre codificado)
      const decodedId = decodeURIComponent(params.id)
      const foundCurso = cursosDB.find(c => c.id === decodedId || c.nombre === decodedId)
      
      if (foundCurso) setCurso(foundCurso)
      else setCurso({ id: 'N/A', nombre: decodedId, creditos: 0, tag: 'Desconocido' })

      const savedCareerId = localStorage.getItem("userCareerId")
      if (savedCareerId) {
        setUserCareer(carrerasDB.find(c => c.id === savedCareerId))
      }
    }
  }, [status, router, params])

  // Auto-scroll del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const newMsg = {
      id: Date.now(),
      user: session?.user?.name?.split(' ')[0] || 'Tú',
      avatar: session?.user?.name ? session.user.name[0] : 'T',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }

    setChatMessages([...chatMessages, newMsg])
    setNewMessage("")
  }

  if (status === "loading" || !mounted || !curso) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#060410' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid rgba(139,92,246,0.2)', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#060410', overflow: 'hidden' }}>
      
      {/* ── Sidebar (Idéntico a los anteriores) ── */}
      <aside style={{ width: '240px', flexShrink: 0, borderRight: '1px solid rgba(139,92,246,0.1)', background: 'rgba(13,8,32,0.6)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '4px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen style={{ width: '16px', height: '16px', color: 'white' }} />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '800', color: '#f0ecff', letterSpacing: '-0.3px' }}>CampusSwap</span>
        </div>

        <nav style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', color: '#5c527a', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 12px', marginBottom: '8px' }}>Principal</p>
          <NavItem icon={LayoutDashboard} label="Dashboard" active onClick={() => router.push('/dashboard')} />
          <NavItem icon={Search} label="Explorar" />
          
          <p style={{ fontSize: '10px', color: '#5c527a', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 12px', margin: '20px 0 8px' }}>Acciones</p>
          <NavItem icon={UploadCloud} label="Subir Apunte" badge="S2" onClick={() => alert("¡Pronto habilitaremos el flujo de carga real!")} />
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

      {/* ── Contenido Principal ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header Superior del Curso */}
        <div style={{ padding: '32px 36px 20px', borderBottom: '1px solid rgba(139,92,246,0.1)', background: 'rgba(6,4,16,0.8)' }}>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#8892b0', cursor: 'pointer', fontSize: '13px', marginBottom: '16px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#bb86fc'}
            onMouseLeave={e => e.currentTarget.style.color = '#8892b0'}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Volver al Dashboard
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(124,58,237,0.3)' }}>
                  {curso.id.toUpperCase()}
                </span>
                <span style={{ color: '#5c527a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users style={{ width: '14px', height: '14px' }} /> 45 Alumnos inscritos
                </span>
              </div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '32px', fontWeight: '800', color: '#f0ecff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                {curso.nombre}
              </h1>
            </div>
            
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}>
              <UploadCloud style={{ width: '18px', height: '18px' }} /> Subir Apunte
            </button>
          </div>
        </div>

        {/* Layout Dividido (Archivos y Chat) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* COLUMNA IZQUIERDA: Apuntes */}
          <div style={{ flex: 1.2, padding: '32px 36px', overflowY: 'auto', borderRight: '1px solid rgba(139,92,246,0.1)' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '700', color: '#f0ecff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText style={{ width: '20px', height: '20px', color: '#bb86fc' }} /> Repositorio de Apuntes
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MOCK_FILES.map(file => (
                <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(26,22,64,0.4)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '12px', padding: '16px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: file.status === 'verified' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText style={{ width: '20px', height: '20px', color: file.status === 'verified' ? '#10b981' : '#f59e0b' }} />
                    </div>
                    <div>
                      <h4 style={{ color: '#f0ecff', fontWeight: '600', fontSize: '14px' }}>{file.name}</h4>
                      <p style={{ color: '#5c527a', fontSize: '12px', marginTop: '2px' }}>{file.size} · Subido por {file.uploader}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {file.status === 'verified' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        <CheckCircle style={{ width: '12px', height: '12px' }} /> Verificado
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        <AlertCircle style={{ width: '12px', height: '12px' }} /> Cuarentena
                      </span>
                    )}
                    <button style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#bb86fc', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="Descargar">
                      <Download style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA: Chat Comunitario */}
          <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', background: 'rgba(13,8,32,0.3)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare style={{ width: '20px', height: '20px', color: '#bb86fc' }} />
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: '700', color: '#f0ecff' }}>Foro del Curso</h2>
            </div>

            {/* Lista de Mensajes */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {chatMessages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', gap: '12px', flexDirection: msg.isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                  {!msg.isMe && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4bbff', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                      {msg.avatar}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    <span style={{ fontSize: '11px', color: '#5c527a', marginBottom: '4px', padding: '0 4px' }}>
                      {msg.isMe ? 'Tú' : msg.user} • {msg.time}
                    </span>
                    <div style={{
                      background: msg.isMe ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(109,40,217,0.25))' : 'rgba(26,22,64,0.6)',
                      border: msg.isMe ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(139,92,246,0.15)',
                      color: '#f0ecff', fontSize: '13px', lineHeight: 1.5, padding: '10px 14px',
                      borderRadius: msg.isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input de Chat */}
            <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid rgba(139,92,246,0.1)', background: 'rgba(6,4,16,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0a0514', border: '1px solid rgba(139,92,246,0.2)', padding: '6px 6px 6px 16px', borderRadius: '12px' }} onFocus={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'}>
                <input
                  type="text"
                  placeholder="Escribe un mensaje al curso..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#f0ecff', fontSize: '14px', outline: 'none' }}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  style={{ background: newMessage.trim() ? '#bb86fc' : 'rgba(139,92,246,0.2)', color: newMessage.trim() ? '#060410' : '#5c527a', border: 'none', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                >
                  <Send style={{ width: '16px', height: '16px', marginLeft: '2px' }} />
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </main>
    </div>
  )
}
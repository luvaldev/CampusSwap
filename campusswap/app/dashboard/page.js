'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, FolderOpen, Search, UploadCloud,
  Star, LogOut, Bell, ChevronRight, FileText,
  Users, TrendingUp, Shield, BookOpen, Clock,
  MoreHorizontal, Download, CheckCircle, AlertCircle
} from "lucide-react"

/* ─── Data mock ─────────────────────────────────── */
const SUBJECTS = [
  {
    id: 1,
    name: 'Ingeniería de Software',
    code: 'ING-420',
    faculty: 'Ingeniería y Ciencias',
    files: 12,
    verified: 9,
    pending: 3,
    color: '#7c3aed',
    colorBg: 'rgba(124,58,237,0.12)',
    lastActivity: 'Hace 2 horas'
  },
  {
    id: 2,
    name: 'Bases de Datos',
    code: 'ING-312',
    faculty: 'Ingeniería y Ciencias',
    files: 8,
    verified: 8,
    pending: 0,
    color: '#0891b2',
    colorBg: 'rgba(8,145,178,0.12)',
    lastActivity: 'Hace 1 día'
  },
  {
    id: 3,
    name: 'Arquitectura de Computadores',
    code: 'ING-215',
    faculty: 'Ingeniería y Ciencias',
    files: 5,
    verified: 3,
    pending: 2,
    color: '#059669',
    colorBg: 'rgba(5,150,105,0.12)',
    lastActivity: 'Hace 3 días'
  },
  {
    id: 4,
    name: 'Cálculo Diferencial',
    code: 'MAT-101',
    faculty: 'Ciencias Básicas',
    files: 15,
    verified: 15,
    pending: 0,
    color: '#d97706',
    colorBg: 'rgba(217,119,6,0.12)',
    lastActivity: 'Hace 5 días'
  }
]

const RECENT_FILES = [
  { name: 'Guía de Patrones de Diseño', subject: 'Ing. de Software', type: 'PDF', status: 'verified', uploader: 'Juan M.', karma: '+20' },
  { name: 'Resumen Normalización', subject: 'Bases de Datos', type: 'DOCX', status: 'quarantine', uploader: 'Tú', karma: 'Pendiente' },
  { name: 'Lab 3 — Pipeline', subject: 'Arq. Computadores', type: 'PDF', status: 'verified', uploader: 'Ana R.', karma: '+15' },
]

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

function SubjectCard({ subject }) {
  return (
    <div style={{
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
      e.currentTarget.style.borderColor = subject.color + '55'
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = `0 8px 30px ${subject.color}18`
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)'
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'none'
    }}
    >
      {/* Color accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: subject.color, borderRadius: '16px 16px 0 0'
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: subject.colorBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <BookOpen style={{ width: '20px', height: '20px', color: subject.color }} />
        </div>
        <button style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#5c527a', padding: '4px', borderRadius: '6px'
        }}>
          <MoreHorizontal style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '10px', color: subject.color, fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
          {subject.code}
        </p>
        <h3 style={{ fontSize: '16px', fontWeight: '600', fontFamily: "'Syne', sans-serif", color: '#f0ecff', lineHeight: 1.3, marginBottom: '4px' }}>
          {subject.name}
        </h3>
        <p style={{ fontSize: '12px', color: '#5c527a' }}>{subject.faculty}</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <CheckCircle style={{ width: '13px', height: '13px', color: '#10b981' }} />
          <span style={{ fontSize: '12px', color: '#9b8fc4' }}>{subject.verified} verificados</span>
        </div>
        {subject.pending > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AlertCircle style={{ width: '13px', height: '13px', color: '#f59e0b' }} />
            <span style={{ fontSize: '12px', color: '#9b8fc4' }}>{subject.pending} en cuarentena</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '12px', borderTop: '1px solid rgba(139,92,246,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FileText style={{ width: '13px', height: '13px', color: '#5c527a' }} />
          <span style={{ fontSize: '12px', color: '#5c527a' }}>{subject.files} archivos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock style={{ width: '11px', height: '11px', color: '#5c527a' }} />
          <span style={{ fontSize: '11px', color: '#5c527a' }}>{subject.lastActivity}</span>
        </div>
      </div>
    </div>
  )
}

function FileRow({ file }) {
  const isVerified = file.status === 'verified'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '12px 16px', borderRadius: '10px',
      transition: 'background 0.15s',
      cursor: 'pointer'
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.06)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px',
        background: isVerified ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <FileText style={{ width: '16px', height: '16px', color: isVerified ? '#10b981' : '#f59e0b' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', color: '#f0ecff', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {file.name}
        </p>
        <p style={{ fontSize: '12px', color: '#5c527a' }}>{file.subject} · {file.uploader}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span style={{
          fontSize: '10px', padding: '3px 8px', borderRadius: '20px',
          background: isVerified ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
          color: isVerified ? '#10b981' : '#f59e0b',
          fontWeight: '600', letterSpacing: '0.5px'
        }}>
          {isVerified ? '✓ VERIFICADO' : '⏳ CUARENTENA'}
        </span>
        <span style={{ fontSize: '12px', color: isVerified ? '#a78bfa' : '#5c527a', fontWeight: '500' }}>
          {file.karma}
        </span>
        <Download style={{ width: '14px', height: '14px', color: '#5c527a' }} />
      </div>
    </div>
  )
}

/* ─── Sidebar nav item ───────────────────────────── */
function NavItem({ icon: Icon, label, active, badge }) {
  return (
    <div style={{
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
      {badge && (
        <span style={{
          fontSize: '10px', fontWeight: '700', padding: '2px 6px',
          borderRadius: '20px', background: 'rgba(251,191,36,0.15)',
          color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)'
        }}>{badge}</span>
      )}
      {active && <ChevronRight style={{ width: '14px', height: '14px', color: '#a78bfa' }} />}
    </div>
  )
}

/* ─── Main Dashboard ─────────────────────────────── */
export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
  }, [status, router])

  if (status === "loading" || !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#060410' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '2px solid rgba(139,92,246,0.2)',
          borderTop: '2px solid #7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (status === "unauthenticated") return null

  const firstName = session?.user?.name?.split(' ')[0] || 'Estudiante'

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#060410', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '240px',
        flexShrink: 0,
        borderRight: '1px solid rgba(139,92,246,0.1)',
        background: 'rgba(13,8,32,0.6)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '4px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BookOpen style={{ width: '16px', height: '16px', color: 'white' }} />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '800', color: '#f0ecff', letterSpacing: '-0.3px' }}>
            CampusSwap
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          <p style={{ fontSize: '10px', color: '#5c527a', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 12px', marginBottom: '8px' }}>
            Principal
          </p>
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={FolderOpen} label="Mis Ramos" />
          <NavItem icon={Search} label="Explorar" />

          <p style={{ fontSize: '10px', color: '#5c527a', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 12px', margin: '20px 0 8px' }}>
            Acciones
          </p>
          <NavItem icon={UploadCloud} label="Subir Apunte" badge="S2" />
          <NavItem icon={Shield} label="Moderar" badge="3" />
          <NavItem icon={Bell} label="Notificaciones" />
        </nav>

        {/* User profile */}
        <div style={{
          borderTop: '1px solid rgba(139,92,246,0.1)',
          paddingTop: '16px',
          marginTop: '16px'
        }}>
          {/* Karma card */}
          <div style={{
            background: 'rgba(251,191,36,0.06)',
            border: '1px solid rgba(251,191,36,0.15)',
            borderRadius: '10px',
            padding: '10px 12px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Star style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
            <div>
              <p style={{ fontSize: '11px', color: '#9b8fc4' }}>Karma Points</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#fbbf24', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
                150 pts
              </p>
            </div>
          </div>

          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px' }}>
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Avatar"
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(124,58,237,0.4)', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0
              }}>
                {firstName[0]}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#f0ecff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session?.user?.name}
              </p>
              <p style={{ fontSize: '11px', color: '#5c527a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session?.user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', marginTop: '12px', padding: '8px', borderRadius: '8px',
              background: 'transparent', border: '1px solid transparent',
              cursor: 'pointer', color: '#5c527a', fontSize: '13px', transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
              e.currentTarget.style.color = '#f87171'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#5c527a'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <LogOut style={{ width: '14px', height: '14px' }} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#5c527a', marginBottom: '4px', fontWeight: '300' }}>
              Bienvenido de vuelta
            </p>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: '800',
              color: '#f0ecff', letterSpacing: '-0.5px', lineHeight: 1
            }}>
              {firstName} 👋
            </h1>
          </div>

          {/* Upload CTA */}
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            border: 'none', color: 'white', cursor: 'pointer',
            fontSize: '14px', fontWeight: '500',
            boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'
          }}
          >
            <UploadCloud style={{ width: '16px', height: '16px' }} />
            Subir Apunte
          </button>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '32px' }}>
          <StatCard icon={FolderOpen} label="Ramos activos" value="4" color="#7c3aed" />
          <StatCard icon={FileText} label="Archivos totales" value="40" sub="36 verificados" color="#0891b2" />
          <StatCard icon={Star} label="Karma acumulado" value="150" sub="+35 este mes" color="#fbbf24" />
          <StatCard icon={Users} label="Comunidad UDP" value="1.2K" sub="Estudiantes activos" color="#10b981" />
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

          {/* Left — Subjects */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '700', color: '#f0ecff' }}>
                Mis Ramos
              </h2>
              <button style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: '13px', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                Ver todos <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {SUBJECTS.map(s => <SubjectCard key={s.id} subject={s} />)}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Recent files */}
            <div style={{
              background: 'rgba(26,22,64,0.5)',
              border: '1px solid rgba(139,92,246,0.12)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid rgba(139,92,246,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: '700', color: '#f0ecff' }}>
                  Actividad reciente
                </h3>
                <TrendingUp style={{ width: '15px', height: '15px', color: '#5c527a' }} />
              </div>
              <div style={{ padding: '8px 4px' }}>
                {RECENT_FILES.map((f, i) => <FileRow key={i} file={f} />)}
              </div>
            </div>

            {/* Quarantine info */}
            <div style={{
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.18)',
              borderRadius: '14px',
              padding: '18px 20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Shield style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fcd34d', fontFamily: "'Syne', sans-serif" }}>
                  Sistema de Cuarentena
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.6, color: '#fde68a' }}>
                Tienes <strong style={{ color: '#fbbf24' }}>3 archivos</strong> pendientes de moderación por la comunidad. Revisar y aprobar material te otorga <strong style={{ color: '#fbbf24' }}>+10 Karma</strong> por cada uno.
              </p>
              <button style={{
                marginTop: '14px', width: '100%', padding: '9px',
                borderRadius: '8px', background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.25)',
                color: '#fbbf24', fontSize: '13px', fontWeight: '500',
                cursor: 'pointer', transition: 'all 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.12)'}
              >
                Ir a moderar →
              </button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}
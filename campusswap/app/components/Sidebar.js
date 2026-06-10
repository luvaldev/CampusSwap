'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, Compass, UploadCloud, Shield, LogOut,
  BookOpen, ChevronRight, Star
} from "lucide-react"

import { carrerasDB } from "../data/database"

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

export default function Sidebar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname() // <-- Hook para saber la ruta actual
  const [userCareer, setUserCareer] = useState(null)

  useEffect(() => {
    const savedCareerId = localStorage.getItem("userCareerId")
    if (savedCareerId) {
      setUserCareer(carrerasDB.find(c => c.id === savedCareerId))
    }
  }, [])

  return (
    <aside style={{ width: '240px', flexShrink: 0, borderRight: '1px solid rgba(139,92,246,0.1)', background: 'rgba(13,8,32,0.6)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '4px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen style={{ width: '16px', height: '16px', color: 'white' }} />
        </div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: '800', color: '#f0ecff', letterSpacing: '-0.3px' }}>CampusSwap</span>
      </div>

      <nav style={{ flex: 1 }}>
        <p style={{ fontSize: '10px', color: '#5c527a', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 12px', marginBottom: '8px' }}>Principal</p>
        
        {/* Usamos pathname para encender el botón correcto */}
        <NavItem icon={LayoutDashboard} label="Dashboard" active={pathname === '/dashboard'} onClick={() => router.push('/dashboard')} />
        <NavItem icon={Compass} label="Explorar" active={pathname.includes('/explorar') || pathname.includes('/curso')} onClick={() => router.push('/dashboard/explorar')} />
        
        <p style={{ fontSize: '10px', color: '#5c527a', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 12px', margin: '20px 0 8px' }}>Acciones</p>
        
        <NavItem icon={UploadCloud} label="Subir Apunte" badge="S2" active={pathname.includes('/subir')} onClick={() => router.push('/dashboard/subir')} />
        <NavItem icon={Shield} label="Moderar" active={pathname.includes('/moderacion')} onClick={() => router.push('/dashboard/moderacion')} />
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
  )
}
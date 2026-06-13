'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  SquaresFour, Compass, UploadSimple, Shield, SignOut,
  BookOpen, CaretRight, Star
} from "@phosphor-icons/react"
import ThemeToggle from "./ThemeToggle"

function NavItem({ icon: Icon, label, active, badge, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`nav-item ${active ? 'nav-item-active' : ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <Icon
        size={18}
        weight={active ? 'fill' : 'regular'}
        className="nav-icon"
        style={{ flexShrink: 0 }}
      />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span className="badge badge-karma">{badge}</span>}
      {active && <CaretRight size={14} className="nav-caret" style={{ flexShrink: 0 }} />}
    </div>
  )
}

export default function Sidebar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [userCareer, setUserCareer] = useState(null)

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/me")
        .then(res => res.json())
        .then(data => {
          if (data && data.career) {
            setUserCareer(data.career)
          }
        })
        .catch(err => console.error("Error al cargar la carrera:", err))
    }
  }, [status])

  const handleLogoClick = () => {
    if (session?.user?.role === 'GUEST') {
      router.push('/dashboard/explorar')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div 
        className="sidebar-logo" 
        onClick={handleLogoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
      >
        <div className="sidebar-logo-icon">
          <BookOpen size={16} weight="bold" color="var(--text-on-brand)" />
        </div>
        <span className="sidebar-logo-text">CampusSwap</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="section-label">Principal</p>
        {session?.user?.role !== 'GUEST' && (
          <NavItem
            icon={SquaresFour}
            label="Dashboard"
            active={pathname === '/dashboard'}
            onClick={() => router.push('/dashboard')}
          />
        )}
        <NavItem
          icon={Compass}
          label="Explorar"
          active={pathname.includes('/explorar') || pathname.includes('/curso')}
          onClick={() => router.push('/dashboard/explorar')}
        />

        {session?.user?.role !== 'GUEST' && (
          <>
            <p className="section-label" style={{ marginTop: 'var(--space-5)' }}>Acciones</p>
            <NavItem
              icon={UploadSimple}
              label="Subir Apunte"
              active={pathname.includes('/subir')}
              onClick={() => router.push('/dashboard/subir')}
            />
            <NavItem
              icon={Shield}
              label="Moderar"
              active={pathname.includes('/moderacion')}
              onClick={() => router.push('/dashboard/moderacion')}
            />
          </>
        )}
        
        <p className="section-label" style={{ marginTop: 'var(--space-5)' }}>Sistema de Puntos</p>
        <NavItem
          icon={Star}
          label="Tienda / Tutorías"
          active={pathname.includes('/tienda')}
          onClick={() => router.push('/dashboard/tienda')}
        />
      </nav>

      {/* User section */}
      <div className="sidebar-footer">
        <div
          className="sidebar-user"
          onClick={() => router.push('/dashboard/perfil')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && router.push('/dashboard/perfil')}
        >
          <img
            src={session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"}
            alt={`Avatar de ${session?.user?.name || 'Estudiante'}`}
            className="sidebar-avatar"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="sidebar-username truncate">
              {session?.user?.name || 'Estudiante'}
            </p>
            {session?.user?.role === 'GUEST' ? (
              <span className="badge" style={{ marginTop: '4px', background: 'var(--warning-subtle)', color: 'var(--warning)' }}>
                Invitado
              </span>
            ) : (
              <span className="badge badge-brand" style={{ marginTop: '4px' }}>
                {userCareer?.tag || 'Sin Carrera'}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => signOut()}
            className="sidebar-logout"
            aria-label="Cerrar sesión"
          >
            <SignOut size={16} /> <span className="logout-text">Cerrar sesión</span>
          </button>
          <ThemeToggle />
        </div>
      </div>

      <style>{`
        .sidebar {
          width: 240px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-subtle);
          background: var(--surface-1);
          display: flex;
          flex-direction: column;
          padding: var(--space-6) var(--space-4);
          overflow-y: auto;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-8);
          padding-left: var(--space-1);
          cursor: pointer;
        }

        .sidebar-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--brand);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-logo-text {
          font-size: var(--text-lg);
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
        }

        .sidebar-nav {
          flex: 1;
        }

        .sidebar-footer {
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-4);
          margin-top: var(--space-4);
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background var(--duration-fast) var(--ease-out);
        }

        .sidebar-user:hover {
          background: var(--surface-2);
        }

        .sidebar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid var(--border-brand);
          flex-shrink: 0;
          object-fit: cover;
        }

        .sidebar-username {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .sidebar-logout {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-2);
          border-radius: var(--radius-sm);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          color: var(--text-muted);
          font-family: var(--font-sans);
          font-size: var(--text-sm);
          transition: all var(--duration-fast);
        }

        .sidebar-logout:hover {
          color: var(--danger);
          background: var(--danger-subtle);
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            height: 64px;
            position: fixed;
            bottom: 0;
            left: 0;
            z-index: var(--z-sticky);
            flex-direction: row;
            padding: 0 var(--space-2);
            border-right: none;
            border-top: 1px solid var(--border-subtle);
            align-items: center;
            justify-content: space-around;
            padding-bottom: env(safe-area-inset-bottom);
          }
          
          .sidebar-logo, .section-label, .sidebar-footer, .badge-karma, .logout-text {
            display: none !important;
          }

          .sidebar-nav {
            display: flex;
            flex-direction: row;
            width: 100%;
            justify-content: space-around;
            align-items: center;
            gap: var(--space-2);
          }

          .nav-item {
            padding: var(--space-3);
            justify-content: center;
            border-radius: var(--radius-pill);
          }

          .nav-item span {
            display: none !important;
          }

          .nav-item svg:not(.nav-icon) {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  )
}
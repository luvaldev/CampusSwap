'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Bell, BookOpen } from "@phosphor-icons/react"

export default function TopBar() {
  const { data: session } = useSession()
  const router = useRouter()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (session?.user) {
      fetch("/api/notifications")
        .then(res => res.json())
        .then(n => {
          if (n.notifications) {
            setNotifications(n.notifications)
            setUnreadCount(n.unreadCount)
          }
        })
        .catch(err => console.error("Error al cargar notificaciones:", err))
    }
  }, [session])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

  const handleLogoClick = () => {
    if (session?.user?.role === 'GUEST') {
      router.push('/dashboard/explorar')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-logo" onClick={handleLogoClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}>
        <div className="topbar-logo-icon">
          <BookOpen size={14} weight="bold" color="var(--text-on-brand)" />
        </div>
        <span className="topbar-logo-text">CampusSwap</span>
      </div>

      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ background: 'var(--surface-2)', padding: 'var(--space-3)', borderRadius: '50%', border: '1px solid var(--border-subtle)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Notificaciones"
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
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-header">
                <span className="topbar-dropdown-title">Notificaciones</span>
                {unreadCount > 0 && (
                  <button onClick={() => handleMarkAsRead()} className="topbar-dropdown-mark-read">
                    Marcar todo como leído
                  </button>
                )}
              </div>
              <div className="topbar-dropdown-body">
                {notifications.length === 0 ? (
                  <div className="topbar-dropdown-empty">
                    No tienes notificaciones
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                      className={`topbar-notification-item ${n.isRead ? 'is-read' : 'is-unread'}`}
                    >
                      <p className="topbar-notification-title">{n.title}</p>
                      <p className="topbar-notification-msg">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => router.push('/dashboard/perfil')}
          style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex' }}
          aria-label="Perfil de usuario"
        >
          <img
            src={session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"}
            alt={`Avatar de ${session?.user?.name || 'Estudiante'}`}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--brand)', objectFit: 'cover' }}
          />
        </button>
      </div>

      <style>{`
        .topbar {
          display: none;
        }

        .topbar-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: var(--space-2);
          background: var(--surface-0);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          width: 320px;
          max-width: calc(100vw - var(--space-8));
          z-index: var(--z-dropdown);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
        }

        .topbar-dropdown-header {
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .topbar-dropdown-title {
          font-weight: 600;
          font-size: var(--text-sm);
        }

        .topbar-dropdown-mark-read {
          font-size: var(--text-xs);
          color: var(--brand);
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .topbar-dropdown-body {
          max-height: 300px;
          overflow-y: auto;
        }

        .topbar-dropdown-empty {
          padding: var(--space-6);
          text-align: center;
          color: var(--text-muted);
          font-size: var(--text-sm);
        }

        .topbar-notification-item {
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: background var(--duration-fast);
        }

        .topbar-notification-item.is-read {
          background: transparent;
          cursor: default;
        }

        .topbar-notification-item.is-unread {
          background: var(--surface-1);
        }

        .topbar-notification-title {
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: 4px;
        }

        .topbar-notification-item.is-read .topbar-notification-title {
          font-weight: 400;
        }

        .topbar-notification-msg {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .topbar {
            display: flex;
            height: 56px;
            width: 100%;
            background: var(--surface-1);
            border-bottom: 1px solid var(--border-subtle);
            align-items: center;
            justify-content: space-between;
            padding: 0 var(--space-4);
            z-index: 99;
            flex-shrink: 0;
          }

          .topbar-logo {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            cursor: pointer;
          }

          .topbar-logo-icon {
            width: 24px;
            height: 24px;
            border-radius: var(--radius-sm);
            background: var(--brand);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .topbar-logo-text {
            font-size: var(--text-base);
            font-weight: 800;
            color: var(--text-primary);
            letter-spacing: -0.02em;
          }

          .topbar-dropdown {
            position: fixed;
            top: 56px;
            left: 0;
            right: 0;
            bottom: calc(64px + env(safe-area-inset-bottom));
            width: 100vw;
            max-width: 100vw;
            height: auto;
            border-radius: 0;
            border-left: none;
            border-right: none;
            margin-top: 0;
            box-shadow: none;
          }

          .topbar-dropdown-body {
            flex: 1;
            max-height: none;
          }
        }
      `}</style>
    </header>
  )
}

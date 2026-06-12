'use client'
import Sidebar from "../components/Sidebar"
import { useSession } from "next-auth/react"
import { BookOpen } from "@phosphor-icons/react"
import { useEffect, useState } from "react"

export default function DashboardLayout({ children }) {
  const { status } = useSession()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    if (status !== 'loading') {
      const timer = setTimeout(() => setShowSplash(false), 800) // Smooth artificial delay
      return () => clearTimeout(timer)
    }
  }, [status])

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <BookOpen size={48} weight="bold" color="var(--brand)" className="splash-icon" />
          <h1 className="splash-title">CampusSwap</h1>
          <div className="splash-loader"></div>
        </div>
        <style>{`
          .splash-screen {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: var(--surface-0);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          .splash-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: fadeIn 0.5s ease-out;
          }
          .splash-icon {
            margin-bottom: var(--space-4);
            animation: pulseIcon 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
          }
          .splash-title {
            font-size: var(--text-3xl);
            font-weight: 800;
            color: var(--text-primary);
            letter-spacing: -0.02em;
            margin-bottom: var(--space-6);
          }
          .splash-loader {
            width: 120px;
            height: 3px;
            background: var(--surface-2);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
          }
          .splash-loader::after {
            content: '';
            position: absolute;
            left: 0; top: 0; height: 100%;
            width: 40%;
            background: var(--brand);
            animation: loadBar 1s infinite ease-in-out;
            border-radius: 4px;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes pulseIcon {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes loadBar {
            0% { left: -40%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        {children}
      </main>

      <style>{`
        .dashboard-shell {
          display: flex;
          min-height: 100dvh;
          background: var(--surface-0);
          overflow: hidden;
          animation: fadeShell 0.3s ease-out;
        }
        @keyframes fadeShell {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .dashboard-main {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-10) var(--space-12);
          position: relative;
        }
        @media (max-width: 768px) {
          .dashboard-main {
            padding: var(--space-5) var(--space-4);
          }
        }
      `}</style>
    </div>
  )
}
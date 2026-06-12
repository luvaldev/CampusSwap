import Sidebar from "../components/Sidebar"

export default function DashboardLayout({ children }) {
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
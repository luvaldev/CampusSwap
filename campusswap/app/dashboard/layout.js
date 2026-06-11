import Sidebar from "../components/Sidebar"

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#060410', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 48px', position: 'relative' }}>
        {children}
      </main>
    </div>
  )
}
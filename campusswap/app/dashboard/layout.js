import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', background: '#060410', overflow: 'hidden' }}>

      <Sidebar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
      
    </div>
  )
}
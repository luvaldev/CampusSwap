import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#060410', overflow: 'hidden' }}>
      <Sidebar />
      
      {children}
    </div>
  )
}
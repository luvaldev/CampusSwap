import { ShieldWarning } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"

export default function GuestRestricted() {
  const router = useRouter()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', textAlign: 'center', maxWidth: 450, margin: '0 auto' }}>
      <ShieldWarning size={80} color="var(--warning)" style={{ marginBottom: 'var(--space-5)' }} />
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>Acceso Restringido</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-8)' }}>
        Para ver y utilizar este apartado de la plataforma, debes ingresar con una cuenta institucional válida (<strong>@udp.cl</strong> o <strong>@mail.udp.cl</strong>).
      </p>
      <button onClick={() => router.push('/')} className="btn btn-primary" style={{ padding: '12px 32px' }}>
        Ir a Iniciar Sesión
      </button>
    </div>
  )
}

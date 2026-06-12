'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Star, Storefront, HandCoins, LockKey } from "@phosphor-icons/react"
import { useEffect, useState } from "react"

export default function TiendaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    if (status === "authenticated") {
      fetch("/api/user/me")
        .then(res => res.json())
        .then(data => setUserData(data))
    }
  }, [status, router])

  if (status === "loading" || !mounted) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner spinner-lg" /></div>
  }

  const karma = userData?.karma || 0
  const isEligible = karma >= 1000

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>Monetiza tu conocimiento</p>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Storefront size={28} color="var(--brand)" /> Tienda & Tutorías
        </h1>
        <p className="page-subtitle">
          Usa tus Karma Points para desbloquear la posibilidad de ofrecer clases privadas o vender resúmenes premium a tus compañeros.
        </p>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div style={{ background: 'var(--surface-2)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
          {isEligible ? (
            <HandCoins size={40} color="var(--karma)" weight="fill" />
          ) : (
            <LockKey size={40} color="var(--text-muted)" weight="bold" />
          )}
        </div>
        
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
          {isEligible ? "¡Desbloqueado!" : "Acceso Restringido"}
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: '45ch', margin: '0 auto var(--space-5)', lineHeight: 'var(--leading-relaxed)' }}>
          {isEligible 
            ? "Has alcanzado 1,000 Karma Points. Ahora puedes crear publicaciones para vender apuntes y ofrecer tutorías." 
            : "Necesitas al menos 1,000 Karma Points para activar tu tienda. Sigue subiendo y moderando apuntes de tu carrera para subir tu Karma."
          }
        </p>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--surface-1)', border: '1px solid var(--border-default)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-pill)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Tu Karma actual:</span>
          <Star size={16} weight="fill" color="var(--karma)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{karma} pts</span>
        </div>

        {isEligible && (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <button className="btn btn-primary">
              Crear Publicación
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="card">
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Tutorías Personalizadas</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Coordina clases por hora. Publica tu link de pago (Flow o MercadoPago) y tu calendario de disponibilidad.</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Apuntes Premium</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Vende guías maestras y resúmenes definitivos. Tus compradores tendrán acceso instantáneo al PDF.</p>
        </div>
      </div>
    </div>
  )
}

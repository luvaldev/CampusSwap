'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  Star, Storefront, HandCoins, LockKey, X,
  CurrencyCircleDollar, FilePdf, ChalkboardTeacher,
  WhatsappLogo, ArrowRight, Trash, Flag
} from "@phosphor-icons/react"
import { useEffect, useState } from "react"

export default function TiendaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [mounted, setMounted] = useState(false)

  // Store state
  const [listings, setListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [filterType, setFilterType] = useState('ALL') // ALL, TUTORIA, APUNTE
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, id: null, title: '', desc: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    contactUrl: '',
    type: 'TUTORIA',
  })

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    if (status === "authenticated") {
      fetchUserData()
      fetchListings()
    }
  }, [status, router])

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/me")
      if (res.ok) {
        const data = await res.json()
        setUserData(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchListings = async (type = 'ALL') => {
    setLoadingListings(true)
    try {
      const res = await fetch(`/api/store?type=${type}`)
      if (res.ok) {
        const data = await res.json()
        setListings(data.listings || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingListings(false)
    }
  }

  const handleFilterChange = (type) => {
    setFilterType(type)
    fetchListings(type)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setShowModal(false)
        setFormData({ title: '', description: '', price: '', contactUrl: '', type: 'TUTORIA' })
        fetchListings(filterType) // refresh
      } else {
        alert("Error al crear la publicación.")
      }
    } catch (err) {
      console.error(err)
      alert("Error de conexión.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (id) => {
    setConfirmModal({
      show: true,
      action: 'delete',
      id,
      title: '¿Eliminar publicación?',
      desc: 'Esta acción no se puede deshacer. Tu publicación desaparecerá de la tienda.'
    })
  }

  const handleReport = (id) => {
    setConfirmModal({
      show: true,
      action: 'report',
      id,
      title: '¿Reportar publicación?',
      desc: 'Si crees que esta publicación infringe nuestras normas, envíala a moderación. Será ocultada inmediatamente de la tienda pública hasta que la revisemos.'
    })
  }

  const executeConfirmAction = async () => {
    const { action, id } = confirmModal
    setConfirmModal({ ...confirmModal, show: false }) // cerramos modal
    
    if (action === 'delete') {
      try {
        const res = await fetch(`/api/store/${id}`, { method: 'DELETE' })
        if (res.ok) {
          fetchListings(filterType)
        } else {
          alert("Error al eliminar la publicación")
        }
      } catch (err) {
        console.error(err)
      }
    } else if (action === 'report') {
      try {
        const res = await fetch(`/api/store/${id}/report`, { method: 'POST' })
        if (res.ok) {
          fetchListings(filterType)
        } else {
          alert("Error al reportar la publicación")
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

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
          {session?.user?.role === 'GUEST' 
            ? "Encuentra tutorías y resúmenes premium de la comunidad para potenciar tu aprendizaje."
            : "Usa tus Karma Points para desbloquear la posibilidad de ofrecer clases privadas o vender resúmenes premium a tus compañeros."}
        </p>
      </div>

      {session?.user?.role !== 'GUEST' && (
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
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Crear Publicación
              </button>
            </div>
          )}
        </div>
      )}

      {/* Intro Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
        <div className="card" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <ChalkboardTeacher size={20} color="var(--brand)" />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Tutorías Personalizadas</h3>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Coordina clases por hora. Publica tu link de pago (Flow o MercadoPago) y tu calendario de disponibilidad.</p>
        </div>
        <div className="card" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <FilePdf size={20} color="var(--brand)" />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Apuntes Premium</h3>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Vende guías maestras y resúmenes definitivos. Tus compradores tendrán acceso instantáneo al PDF.</p>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: 'var(--space-8) 0' }} />

      {/* Store Listings Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Mercado Universitario</h2>
          
          <div style={{ display: 'flex', background: 'var(--surface-1)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <button 
              onClick={() => handleFilterChange('ALL')}
              className={`btn btn-sm ${filterType === 'ALL' ? '' : 'btn-ghost'}`}
              style={{ background: filterType === 'ALL' ? 'var(--surface-2)' : 'transparent', color: filterType === 'ALL' ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              Todos
            </button>
            <button 
              onClick={() => handleFilterChange('TUTORIA')}
              className={`btn btn-sm ${filterType === 'TUTORIA' ? '' : 'btn-ghost'}`}
              style={{ background: filterType === 'TUTORIA' ? 'var(--surface-2)' : 'transparent', color: filterType === 'TUTORIA' ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              Clases
            </button>
            <button 
              onClick={() => handleFilterChange('APUNTE')}
              className={`btn btn-sm ${filterType === 'APUNTE' ? '' : 'btn-ghost'}`}
              style={{ background: filterType === 'APUNTE' ? 'var(--surface-2)' : 'transparent', color: filterType === 'APUNTE' ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              Archivos
            </button>
          </div>
        </div>

        {loadingListings ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
             {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
             <Storefront size={42} weight="fill" color="var(--border-strong)" style={{ marginBottom: 'var(--space-4)' }} />
             <p style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>No hay publicaciones aún</p>
             <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>{filterType === 'ALL' ? "Sé el primero en ofrecer un servicio." : "No hay resultados para este filtro."}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {listings.map(listing => (
              <div key={listing.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <span className="badge badge-neutral mono" style={{ background: listing.type === 'TUTORIA' ? 'var(--brand-subtle)' : 'var(--success-subtle)', color: listing.type === 'TUTORIA' ? 'var(--brand)' : 'var(--success)' }}>
                    {listing.type === 'TUTORIA' ? 'Clase Particular' : 'Apunte Premium'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                    <CurrencyCircleDollar size={18} color="var(--success)" />
                    {listing.price === 0 ? 'Gratis' : `$${listing.price.toLocaleString('es-CL')}`}
                  </div>
                </div>
                
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)', lineHeight: 1.2 }}>{listing.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {listing.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                  {listing.user.image ? (
                     <img src={listing.user.image} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                  ) : (
                     <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                       {listing.user.name?.[0] || '?'}
                     </div>
                  )}
                  <div style={{ fontSize: 'var(--text-xs)' }}>
                    <p style={{ fontWeight: 600 }}>{listing.user.name || 'Anónimo'}</p>
                    <p style={{ color: 'var(--karma)', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Star weight="fill" size={10} /> {listing.user.karma} pts
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <a href={listing.contactUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    Contactar <ArrowRight size={14} />
                  </a>
                  {session?.user?.id === listing.userId ? (
                    <button onClick={() => handleDelete(listing.id)} className="btn btn-danger btn-sm" style={{ padding: '0 10px' }} title="Eliminar publicación">
                      <Trash size={16} />
                    </button>
                  ) : (
                    <button onClick={() => handleReport(listing.id)} className="btn btn-ghost btn-sm" style={{ padding: '0 10px', color: 'var(--warning)' }} title="Reportar publicación">
                      <Flag size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 'var(--space-6)', position: 'relative' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-5)' }}>Crear Publicación</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="label">Tipo de Servicio</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--surface-1)', border: formData.type === 'TUTORIA' ? '2px solid var(--brand)' : '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                    <input type="radio" name="type" value="TUTORIA" checked={formData.type === 'TUTORIA'} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ display: 'none' }} />
                    <ChalkboardTeacher size={20} color={formData.type === 'TUTORIA' ? 'var(--brand)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: formData.type === 'TUTORIA' ? 600 : 400 }}>Clase / Tutoría</span>
                  </label>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--surface-1)', border: formData.type === 'APUNTE' ? '2px solid var(--success)' : '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                    <input type="radio" name="type" value="APUNTE" checked={formData.type === 'APUNTE'} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ display: 'none' }} />
                    <FilePdf size={20} color={formData.type === 'APUNTE' ? 'var(--success)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: formData.type === 'APUNTE' ? 600 : 400 }}>Apunte Premium</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="label">Título</label>
                <input required type="text" className="input" placeholder="Ej: Tutoría de Cálculo III (Preparación Certamen)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              <div>
                <label className="label">Descripción</label>
                <textarea required className="input" rows={3} placeholder="Detalla qué incluye tu servicio, metodología, formato, etc." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Precio (CLP)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                    <input required type="number" min="0" className="input" style={{ paddingLeft: 28 }} placeholder="0 para Gratis" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Enlace de Contacto (WhatsApp o Correo)</label>
                <input required type="url" className="input" placeholder="wa.me/569... o mailto:tu@correo.com" value={formData.contactUrl} onChange={e => setFormData({...formData, contactUrl: e.target.value})} />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                  CampusSwap es un foro gratuito y no procesa pagos. Provee un link directo a tu WhatsApp (usando <span className="mono">https://wa.me/tu_numero</span>) o a tu correo (usando <span className="mono">mailto:tu@correo.com</span>) para que los estudiantes se contacten contigo y coordinen.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? <div className="spinner spinner-sm" /> : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmModal.show && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 'var(--space-6)', position: 'relative' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>{confirmModal.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)', lineHeight: 1.5 }}>
              {confirmModal.desc}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmModal({ ...confirmModal, show: false })}>
                Cancelar
              </button>
              <button className={`btn ${confirmModal.action === 'delete' ? 'btn-danger' : 'btn-primary'}`} style={{ flex: 1 }} onClick={executeConfirmAction}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

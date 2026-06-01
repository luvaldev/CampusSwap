'use client'
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { ShieldAlert, BookOpen, AlertOctagon, ArrowRight, Sparkles } from "lucide-react"

function LoginCard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [mounted, setMounted] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === "authenticated") return null

  const handleSignIn = async () => {
    setIsSigningIn(true)
    await signIn('google')
    setIsSigningIn(false)
  }

  return (
    <div
      className="relative w-full max-w-[420px]"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease'
      }}
    >
      {/* Glow backdrop */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'linear-gradient(135deg, rgba(26,22,64,0.9) 0%, rgba(18,16,42,0.95) 100%)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '20px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              marginBottom: '20px',
              boxShadow: '0 4px 20px rgba(124,58,237,0.4)'
            }}
          >
            <BookOpen style={{ width: '28px', height: '28px', color: '#f0ecff' }} />
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '32px',
              fontWeight: '800',
              color: '#f0ecff',
              letterSpacing: '-0.5px',
              lineHeight: 1.1,
              marginBottom: '8px'
            }}
          >
            CampusSwap
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: '#9b8fc4',
              fontWeight: '300',
              letterSpacing: '0.5px'
            }}
          >
            Red Académica · Universidad Diego Portales
          </p>
        </div>

        {/* Error alert */}
        {error === 'AccessDenied' && (
          <div
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'slideIn 0.3s ease'
            }}
          >
            <AlertOctagon style={{ width: '18px', height: '18px', color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ fontSize: '13px', color: '#fca5a5', fontWeight: '500', marginBottom: '2px' }}>
                Acceso denegado
              </p>
              <p style={{ fontSize: '12px', color: '#f87171', lineHeight: 1.5 }}>
                Solo se permiten cuentas <strong style={{ color: '#fca5a5' }}>@udp.cl</strong> o <strong style={{ color: '#fca5a5' }}>@mail.udp.cl</strong>
              </p>
            </div>
          </div>
        )}

        {/* Info notice */}
        <div
          style={{
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <ShieldAlert style={{ width: '18px', height: '18px', color: '#a78bfa', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '13px', color: '#c4b5fd', lineHeight: 1.5 }}>
            Plataforma de acceso exclusivo para la comunidad UDP. Ingresa con tu correo institucional.
          </p>
        </div>

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          disabled={isSigningIn}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 20px',
            background: isSigningIn
              ? 'rgba(124,58,237,0.5)'
              : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            border: 'none',
            borderRadius: '12px',
            color: '#f0ecff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '15px',
            fontWeight: '500',
            cursor: isSigningIn ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isSigningIn ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
            letterSpacing: '0.2px'
          }}
          onMouseEnter={e => {
            if (!isSigningIn) {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,58,237,0.55)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.4)'
          }}
        >
          {isSigningIn ? (
            <>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}
              />
              Verificando credenciales...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google Institucional
              <ArrowRight style={{ width: '16px', height: '16px', marginLeft: 'auto', opacity: 0.7 }} />
            </>
          )}
        </button>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '24px'
          }}
        >
          <Sparkles style={{ width: '12px', height: '12px', color: '#5c527a' }} />
          <p style={{ fontSize: '12px', color: '#5c527a', textAlign: 'center' }}>
            Tus datos están seguros. Solo usamos OAuth2.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#060410',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none'
        }}
      />
      {/* Radial gradient */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 65%)',
          pointerEvents: 'none'
        }}
      />

      <Suspense fallback={
        <div style={{
          width: '40px', height: '40px',
          border: '2px solid rgba(139,92,246,0.2)',
          borderTop: '2px solid #7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      }>
        <LoginCard />
      </Suspense>
    </main>
  )
}
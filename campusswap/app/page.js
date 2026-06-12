'use client'
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { ShieldWarning, BookOpen, WarningOctagon, ArrowRight, Sparkle, GoogleLogo, MagnifyingGlass, FileText, Star } from "@phosphor-icons/react"
import ThemeToggle from "./components/ThemeToggle"

function LoginCard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [mounted, setMounted] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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
    <div className="login-card-wrapper" data-mounted={mounted}>
      <div className="login-card-split">
        {/* LADO IZQUIERDO: LOGIN */}
        <div className="login-left">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
            <div className="login-logo-small">
              <BookOpen size={20} weight="bold" color="var(--text-on-brand)" />
              <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>CampusSwap</span>
            </div>
            <ThemeToggle />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
              ¡Hola de nuevo!
            </p>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 'var(--space-8)' }}>
              Inicia Sesión
            </h1>

            {/* Error alert */}
            {error === 'AccessDenied' && (
              <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>
                <WarningOctagon size={18} style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 500, marginBottom: '2px' }}>Acceso denegado</p>
                  <p style={{ fontSize: 'var(--text-xs)' }}>Solo se permiten cuentas <strong>@udp.cl</strong> o <strong>@mail.udp.cl</strong></p>
                </div>
              </div>
            )}

            {/* Info notice */}
            <div className="alert alert-brand" style={{ marginBottom: 'var(--space-6)' }}>
              <ShieldWarning size={18} style={{ flexShrink: 0 }} />
              <p>Acceso exclusivo comunidad UDP. Usa tu correo institucional.</p>
            </div>

            <div style={{ position: 'relative', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--border-subtle)', zIndex: 1 }}></div>
              <span style={{ position: 'relative', zIndex: 2, background: 'var(--surface-0)', padding: '0 var(--space-3)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                Ingresa con
              </span>
            </div>

            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="google-signin-btn"
            >
              {isSigningIn ? (
                <>
                  <div className="spinner spinner-sm" /> Ingresando...
                </>
              ) : (
                <>
                  <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continuar con Google</span>
                </>
              )}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-8)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Universidad Diego Portales
          </p>
        </div>

        {/* LADO DERECHO: ILUSTRACIÓN / INFO */}
        <div className="login-right">
          <div className="login-right-content">
            <div style={{ background: 'color-mix(in oklch, var(--surface-0) 20%, transparent)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(10px)', border: '1px solid color-mix(in oklch, var(--border-subtle) 30%, transparent)' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', lineHeight: 1.2 }}>
                La red académica <br />que necesitabas.
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <li style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <div className="feature-icon"><MagnifyingGlass size={16} weight="bold" color="var(--brand)" /></div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Encuentra apuntes de tu carrera</span>
                </li>
                <li style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <div className="feature-icon"><FileText size={16} weight="bold" color="var(--brand)" /></div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Sube material y colabora</span>
                </li>
                <li style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <div className="feature-icon"><Star size={16} weight="bold" color="var(--brand)" /></div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Gana Karma y sube de Rango</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-card-wrapper {
          position: relative;
          width: 100%;
          max-width: 950px; /* Tarjeta ancha para el Split View */
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out);
        }

        .login-card-wrapper[data-mounted="true"] {
          opacity: 1;
          transform: translateY(0);
        }

        .login-card-split {
          background: var(--surface-0);
          border: 1px solid var(--border-subtle);
          border-radius: 2rem;
          box-shadow: var(--shadow-xl);
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          min-height: 600px;
        }

        .login-left {
          padding: var(--space-8) var(--space-10);
          display: flex;
          flex-direction: column;
        }

        .login-logo-small {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .login-logo-small svg {
          padding: 4px;
          background: var(--brand);
          border-radius: var(--radius-sm);
        }

        .login-right {
          background: var(--surface-2);
          background-image: radial-gradient(circle at top right, color-mix(in oklch, var(--brand) 20%, transparent), transparent 50%),
                            radial-gradient(circle at bottom left, color-mix(in oklch, var(--info) 15%, transparent), transparent 50%);
          padding: var(--space-8);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-right-content {
          position: relative;
          width: 100%;
          max-width: 320px;
          z-index: 2;
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--surface-0);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        .google-signin-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          width: 100%;
          padding: 14px 24px;
          border-radius: var(--radius-pill);
          background: #ffffff;
          border: 1px solid #dadce0;
          color: #3c4043;
          font-size: var(--text-base);
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
        }

        .google-signin-btn:hover {
          background-color: #f8f9fa;
          border-color: #d2d4d7;
          box-shadow: 0 1px 3px rgba(60, 64, 67, 0.15);
        }

        .google-signin-btn:active {
          background-color: #eeeeee;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.1);
        }

        .google-signin-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .google-signin-btn .spinner {
          border-color: rgba(60, 64, 67, 0.2);
          border-top-color: #3c4043;
        }

        @media (max-width: 800px) {
          .login-card-split {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .login-right {
            display: none;
          }
          .login-left {
            padding: var(--space-6) var(--space-5);
          }
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  return (
    <main className="login-page">
      {/* Subtle background grid */}
      <div className="login-bg-grid" aria-hidden="true" />

      <Suspense fallback={<div className="spinner spinner-lg" />}>
        <LoginCard />
      </Suspense>

      <style>{`
        .login-page {
          display: flex;
          min-height: 100dvh;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          background: var(--surface-1);
          position: relative;
          overflow: hidden;
        }

        .login-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(oklch(50% 0.05 200 / 0.05) 1px, transparent 1px),
            linear-gradient(90deg, oklch(50% 0.05 200 / 0.05) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
        }
      `}</style>
    </main>
  )
}
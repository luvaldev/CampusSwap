'use client'
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { ShieldAlert, BookOpen, AlertOctagon } from "lucide-react"

// Separamos el contenido en un componente para poder usar useSearchParams correctamente
function LoginCard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Capturamos el error de la URL
  const error = searchParams.get('error')

  // Si ya está logueado, lo mandamos al dashboard
  if (status === "authenticated") {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="z-10 max-w-md w-full items-center justify-between font-mono text-sm border border-[#2d1b4d] bg-[#0a0514]/80 p-8 rounded-2xl shadow-[0_0_40px_rgba(187,134,252,0.1)] backdrop-blur-md text-center">
      
      <div className="flex justify-center mb-6">
        <BookOpen className="w-16 h-16 text-[#bb86fc]" />
      </div>
      
      <h1 className="text-4xl font-bold mb-2 text-[#bb86fc] tracking-tighter">CampusSwap</h1>
      <p className="text-[#8892b0] mb-8 text-lg">Digitalizando el Éxito Estudiantil</p>

      {/* --- ALERTA DE ERROR DINÁMICA --- */}
      {error === 'AccessDenied' && (
        <div className="bg-red-950/50 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3 text-left shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <AlertOctagon className="w-6 h-6 text-red-400 shrink-0 mt-1" />
          <p className="text-sm text-red-200">
            <strong>Acceso Denegado:</strong> Correo no autorizado. Por favor, utiliza exclusivamente tu cuenta institucional terminada en <strong className="text-white">@udp.cl</strong> o <strong className="text-white">@mail.udp.cl</strong>.
          </p>
        </div>
      )}

      {/* Mensaje informativo normal */}
      <div className="bg-[#1a0b2e] border border-[#ff00ff]/30 rounded-lg p-4 mb-8 flex items-start gap-3 text-left">
        <ShieldAlert className="w-6 h-6 text-[#ff00ff] shrink-0 mt-1" />
        <p className="text-sm text-[#ccd6f6]">
          Acceso restringido. Solo se admiten cuentas institucionales de la Universidad Diego Portales.
        </p>
      </div>

      <button 
        onClick={() => signIn('google')}
        className="w-full bg-[#bb86fc] hover:bg-[#a364ff] text-[#0a0514] font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
        Ingresar con Google Institucional
      </button>
    </div>
  )
}

// El componente principal que exportamos
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a0b2e] via-[#0a0514] to-[#0a0514]">
      {/* Suspense es requerido por Next.js al usar searchParams en el cliente */}
      <Suspense fallback={
        <div className="w-16 h-16 border-4 border-[#bb86fc] border-t-transparent rounded-full animate-spin"></div>
      }>
        <LoginCard />
      </Suspense>
    </main>
  )
}

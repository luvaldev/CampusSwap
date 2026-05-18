'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { FolderGit2, LogOut, Search, UploadCloud, Star } from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "unauthenticated") {
    router.push('/')
    return null
  }

  return (
    <div className="flex h-screen bg-[#0a0514]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#2d1b4d] bg-[#1a0b2e]/50 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-[#bb86fc] mb-8">CampusSwap</h2>
        
        <nav className="flex-1 space-y-4">
          <a href="#" className="flex items-center gap-3 text-[#ccd6f6] hover:text-[#bb86fc] transition-colors p-2 rounded-lg bg-[#2d1b4d]/40 border border-[#bb86fc]/20">
            <FolderGit2 className="w-5 h-5" /> Mis Ramos
          </a>
          <a href="#" className="flex items-center gap-3 text-[#8892b0] hover:text-[#bb86fc] transition-colors p-2">
            <Search className="w-5 h-5" /> Explorar Facultad
          </a>
          <a href="#" className="flex items-center gap-3 text-[#8892b0] hover:text-[#bb86fc] transition-colors p-2">
            <UploadCloud className="w-5 h-5" /> Subir Apunte (S2)
          </a>
        </nav>

        {/* Perfil Usuario */}
        <div className="border-t border-[#2d1b4d] pt-4 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <img src={session?.user?.image} alt="Perfil" className="w-10 h-10 rounded-full border border-[#ff00ff]" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-[#ccd6f6] truncate">{session?.user?.name}</p>
              <p className="text-xs text-[#ff00ff] flex items-center gap-1"><Star className="w-3 h-3"/> 150 Karma</p>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[#ccd6f6]">Bienvenido, {session?.user?.name?.split(' ')[0]}</h1>
          <p className="text-[#8892b0]">Aquí tienes un resumen de tus ramos actuales.</p>
        </header>

        {/* Mockup de Ramos para el Sprint 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Ingeniería de Software', 'Bases de Datos', 'Arquitectura de Computadores'].map((ramo, i) => (
            <div key={i} className="border border-[#2d1b4d] bg-[#1a0b2e] p-6 rounded-xl hover:border-[#bb86fc] transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-[#2d1b4d] flex items-center justify-center mb-4 group-hover:bg-[#bb86fc]/20">
                <FolderGit2 className="w-6 h-6 text-[#bb86fc]" />
              </div>
              <h3 className="text-xl font-bold text-[#ccd6f6] mb-2">{ramo}</h3>
              <p className="text-sm text-[#8892b0]">4 apuntes verificados</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { FolderGit2, LogOut, ShieldAlert, Archive, BookOpen, PlusCircle, Clock, GraduationCap } from "lucide-react"

// Importamos nuestra Base de Datos Dinámica
import { carrerasDB, cursosDB } from "../data/database"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // ESTADOS DEL USUARIO
  const [userCareer, setUserCareer] = useState(null)
  const [misRamos, setMisRamos] = useState([]) // Array de IDs y estados: [{ id: 'isw', estado: 'actual' }]
  
  // ESTADOS DE LA UI
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [selectedCareerId, setSelectedCareerId] = useState("")
  const [cooldownError, setCooldownError] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  // 1. CARGA INICIAL DE DATOS
  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
    
    // Leer del almacenamiento local (Simulando petición a API)
    const savedCareerId = localStorage.getItem("userCareerId")
    const savedRamos = JSON.parse(localStorage.getItem("userRamos")) || []
    
    if (savedCareerId) {
      const careerObj = carrerasDB.find(c => c.id === savedCareerId)
      setUserCareer(careerObj)
      setMisRamos(savedRamos)
    } else {
      setShowOnboarding(true)
    }
  }, [status, router])

  // 2. LÓGICA DEL CUESTIONARIO (ONBOARDING)
  const handleSaveCareer = () => {
    if (!selectedCareerId) return

    const lastChanged = localStorage.getItem("careerLastChanged")
    const now = new Date().getTime()
    const TWO_MONTHS_MS = 5184000000

    if (lastChanged && now - parseInt(lastChanged) < TWO_MONTHS_MS) {
      const daysLeft = Math.ceil((TWO_MONTHS_MS - (now - parseInt(lastChanged))) / (1000 * 60 * 60 * 24))
      setCooldownError(`Solo puedes cambiar tu carrera una vez cada 2 meses. Faltan ${daysLeft} días.`)
      return
    }

    const careerObj = carrerasDB.find(c => c.id === selectedCareerId)
    localStorage.setItem("userCareerId", selectedCareerId)
    localStorage.setItem("careerLastChanged", now.toString())
    // Si cambia de carrera, reiniciamos sus ramos
    localStorage.setItem("userRamos", JSON.stringify([])) 
    
    setUserCareer(careerObj)
    setMisRamos([])
    setShowOnboarding(false)
    setCooldownError("")
  }

  // 3. LÓGICA DE GESTIÓN DE RAMOS
  const agregarRamo = (cursoId) => {
    const nuevosRamos = [...misRamos, { id: cursoId, estado: 'actual' }]
    setMisRamos(nuevosRamos)
    localStorage.setItem("userRamos", JSON.stringify(nuevosRamos))
    setShowAddModal(false)
  }

  const toggleCursoEstado = (cursoId) => {
    const nuevosRamos = misRamos.map(ramo => {
      if (ramo.id === cursoId) {
        return { ...ramo, estado: ramo.estado === 'actual' ? 'archivado' : 'actual' }
      }
      return ramo
    })
    setMisRamos(nuevosRamos)
    localStorage.setItem("userRamos", JSON.stringify(nuevosRamos))
  }

  // 4. PREPARACIÓN DE DATOS PARA LA VISTA
  // Rehidratamos los IDs guardados con la información real de la base de datos
  const ramosCompletos = misRamos.map(mr => {
    const cursoData = cursosDB.find(c => c.id === mr.id)
    return { ...cursoData, estado: mr.estado }
  }).filter(c => c !== undefined)

  const cursosActuales = ramosCompletos.filter(c => c.estado === 'actual')
  const cursosArchivados = ramosCompletos.filter(c => c.estado === 'archivado')

  // Filtramos los cursos que el usuario puede agregar (Que sean de su carrera y no los tenga ya)
  const cursosDisponibles = userCareer 
    ? cursosDB.filter(c => c.carreras.includes(userCareer.id) && !misRamos.some(mr => mr.id === c.id))
    : []

  if (status === "loading") return <div className="min-h-screen bg-[#0a0514] flex items-center justify-center"><div className="animate-spin h-12 w-12 border-b-2 border-[#bb86fc] rounded-full"></div></div>

  return (
    <div className="flex h-screen bg-[#0a0514]">
      
      {/* --- MODAL DE ONBOARDING --- */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a0b2e] border border-[#bb86fc]/30 p-8 rounded-2xl max-w-lg w-full">
            <h2 className="text-3xl font-bold text-[#bb86fc] mb-4">Bienvenido a CampusSwap</h2>
            <p className="text-[#8892b0] mb-6">Para personalizar tu catálogo de ramos, selecciona tu carrera. <strong className="text-yellow-400">Atención: Solo podrás hacer un cambio cada 2 meses.</strong></p>
            
            <select 
              className="w-full bg-[#0a0514] border border-[#2d1b4d] text-[#ccd6f6] rounded-lg p-3 mb-4 focus:outline-none focus:border-[#bb86fc]"
              value={selectedCareerId}
              onChange={(e) => setSelectedCareerId(e.target.value)}
            >
              <option value="" disabled>Selecciona tu carrera...</option>
              {carrerasDB.map(carrera => (
                <option key={carrera.id} value={carrera.id}>{carrera.nombre}</option>
              ))}
            </select>

            {cooldownError && <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-lg border border-red-400/30">{cooldownError}</p>}

            <button onClick={handleSaveCareer} className="w-full bg-[#bb86fc] hover:bg-[#a364ff] text-[#0a0514] font-bold py-3 rounded-lg transition-all">
              Guardar y Continuar
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL PARA AÑADIR RAMOS --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a0b2e] border border-[#2d1b4d] p-8 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#ccd6f6]">Añadir Ramo a mi Catálogo</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#8892b0] hover:text-white">✕</button>
            </div>
            
            <div className="overflow-y-auto space-y-3 flex-1 pr-2">
              {cursosDisponibles.length === 0 ? (
                <p className="text-center text-[#8892b0] py-8">Ya tienes todos los ramos de tu malla inscritos o no hay ramos disponibles.</p>
              ) : (
                cursosDisponibles.map(curso => (
                  <div key={curso.id} className="flex items-center justify-between bg-[#0a0514] border border-[#2d1b4d] p-4 rounded-xl hover:border-[#bb86fc]/50 transition-colors">
                    <div>
                      <h4 className="text-[#ccd6f6] font-bold">{curso.nombre}</h4>
                      <p className="text-[#8892b0] text-sm">{curso.creditos} Créditos Académicos</p>
                    </div>
                    <button onClick={() => agregarRamo(curso.id)} className="flex items-center gap-2 bg-[#bb86fc]/10 text-[#bb86fc] px-4 py-2 rounded-lg hover:bg-[#bb86fc]/20 transition-colors border border-[#bb86fc]/30">
                      <PlusCircle className="w-4 h-4" /> Inscribir
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-[#2d1b4d] bg-[#0d0820] flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#bb86fc]">CampusSwap</h2>
          <p className="text-xs text-[#8892b0] mt-1 truncate" title={userCareer?.nombre}>{userCareer?.nombre || 'Configurando...'}</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 text-[#ccd6f6] bg-[#2d1b4d]/50 border border-[#bb86fc]/30 p-3 rounded-xl transition-all">
            <BookOpen className="w-5 h-5 text-[#bb86fc]" /> Mis Ramos
          </button>
          <button className="w-full flex items-center gap-3 text-[#8892b0] hover:text-[#bb86fc] hover:bg-[#2d1b4d]/30 p-3 rounded-xl transition-all" onClick={() => router.push('/dashboard/moderacion')}>
            <ShieldAlert className="w-5 h-5" /> Moderación
          </button>
        </nav>

        <div className="p-4 border-t border-[#2d1b4d]">
          {/* TAG DE CARRERA EN PERFIL */}
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={session?.user?.image} alt="Perfil" className="w-10 h-10 rounded-full border border-[#bb86fc]" />
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[#ccd6f6] truncate">{session?.user?.name?.split(' ')[0]}</p>
                {userCareer && (
                  <span className="bg-[#bb86fc]/10 text-[#bb86fc] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#bb86fc]/30">
                    {userCareer.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#fbbf24] mt-0.5">150 Karma</p>
            </div>
          </div>
          <button onClick={() => signOut()} className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-[#ccd6f6]">Catálogo de Estudio</h1>
            <p className="text-[#8892b0] mt-2">Gestiona los ramos de tu semestre o archiva los ya aprobados.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#bb86fc] text-[#0a0514] px-5 py-3 rounded-xl font-bold hover:bg-[#a364ff] transition-all shadow-[0_0_15px_rgba(187,134,252,0.3)]">
            <PlusCircle className="w-5 h-5" /> Añadir Ramo
          </button>
        </header>

        {/* CURSOS ACTUALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {cursosActuales.length === 0 ? (
            <div className="col-span-full border border-dashed border-[#2d1b4d] rounded-2xl p-12 text-center">
              <GraduationCap className="w-12 h-12 text-[#8892b0] mx-auto mb-4" />
              <p className="text-[#ccd6f6] font-bold text-lg">Aún no tienes ramos inscritos</p>
              <p className="text-[#8892b0]">Haz clic en "Añadir Ramo" para empezar a organizar tu semestre.</p>
            </div>
          ) : (
            cursosActuales.map((curso) => (
              <div key={curso.id} className="border border-[#2d1b4d] bg-[#1a0b2e] p-6 rounded-2xl relative group hover:border-[#bb86fc] hover:shadow-[0_0_20px_rgba(187,134,252,0.1)] transition-all">
                <button 
                  onClick={() => toggleCursoEstado(curso.id)}
                  className="absolute top-4 right-4 p-2 bg-[#0a0514] rounded-lg text-[#8892b0] hover:text-[#fbbf24] opacity-0 group-hover:opacity-100 transition-all border border-[#2d1b4d] hover:border-[#fbbf24]/50"
                  title="Aprobar y Archivar Ramo"
                >
                  <Archive className="w-4 h-4" />
                </button>

                <div onClick={() => router.push(`/dashboard/curso/${encodeURIComponent(curso.nombre)}`)} className="cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-[#0a0514] border border-[#2d1b4d] flex items-center justify-center mb-4 text-[#bb86fc] group-hover:bg-[#bb86fc]/10 transition-colors">
                    <FolderGit2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#ccd6f6] mb-2 leading-tight">{curso.nombre}</h3>
                  <div className="flex items-center gap-2 text-[#8892b0] text-sm mt-4">
                    <span className="flex items-center gap-1 bg-[#0a0514] px-2 py-1 rounded-md border border-[#2d1b4d]"><BookOpen className="w-3 h-3"/> {curso.creditos} Créditos</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CARPETA ARCHIVADOS */}
        {cursosArchivados.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#8892b0] mb-6 flex items-center gap-2">
              <Archive className="w-6 h-6" /> Ramos Aprobados / Archivados
            </h2>
            <div className="flex flex-wrap gap-4">
              {cursosArchivados.map((curso) => (
                <div 
                  key={curso.id} 
                  onClick={() => toggleCursoEstado(curso.id)}
                  title="Clic para restaurar al semestre actual"
                  className="flex items-center gap-3 bg-[#0d0820] border border-[#2d1b4d] px-4 py-3 rounded-xl opacity-70 hover:opacity-100 cursor-pointer transition-opacity hover:border-[#bb86fc]/50"
                >
                  <FolderGit2 className="w-4 h-4 text-[#8892b0]" />
                  <span className="text-[#ccd6f6] font-medium">{curso.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
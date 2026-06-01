'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, FileText, UploadCloud, MessageSquare, Send } from "lucide-react"

export default function CursoPage({ params }) {
  const router = useRouter()
  const nombreCurso = decodeURIComponent(params.id)

  // LÓGICA DE CHAT INTERACTIVO
  const [mensajes, setMensajes] = useState([
    { id: 1, emisor: 'Andrés', texto: '¿Alguien entendió el ejercicio 3?', hora: '10:30 AM', soyYo: false }
  ])
  const [nuevoMensaje, setNuevoMensaje] = useState("")

  const enviarMensaje = (e) => {
    e.preventDefault()
    if (!nuevoMensaje.trim()) return

    const msj = {
      id: Date.now(),
      emisor: 'Tú',
      texto: nuevoMensaje,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      soyYo: true
    }
    setMensajes([...mensajes, msj])
    setNuevoMensaje("")
  }

  // LÓGICA DE ARCHIVOS (Mock de subida)
  const [archivos, setArchivos] = useState([
    { id: 1, nombre: 'Resumen_Prueba_1.pdf', autor: 'Estudiante', fecha: 'Hace 2 días' }
  ])

  const simularSubida = () => {
    const nuevoArchivo = {
      id: Date.now(),
      nombre: `Mi_Apunte_${archivos.length + 1}.pdf`,
      autor: 'Tú',
      fecha: 'Justo ahora'
    }
    setArchivos([nuevoArchivo, ...archivos])
    alert("Archivo enviado a Cuarentena para moderación. ¡Gracias por aportar!")
  }

  return (
    <div className="flex h-screen bg-[#0a0514]">
      {/* SIDEBAR ARCHIVOS */}
      <aside className="w-1/3 border-r border-[#2d1b4d] bg-[#0d0820] flex flex-col">
        <div className="p-6 border-b border-[#2d1b4d]">
          <button onClick={() => router.push('/dashboard')} className="text-[#8892b0] flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <h2 className="text-2xl font-bold text-[#ccd6f6]">{nombreCurso}</h2>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {archivos.map((archivo) => (
            <div key={archivo.id} className="flex items-center gap-3 bg-[#1a0b2e] border border-[#2d1b4d] p-3 rounded-xl">
              <FileText className="w-5 h-5 text-[#bb86fc]" />
              <div>
                <p className="text-[#ccd6f6] font-medium text-sm">{archivo.nombre}</p>
                <p className="text-[#8892b0] text-xs">Subido por {archivo.autor} • {archivo.fecha}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6">
          <button onClick={simularSubida} className="w-full bg-[#2d1b4d] text-[#bb86fc] border border-[#bb86fc]/30 font-bold py-3 rounded-xl flex justify-center gap-2">
            <UploadCloud className="w-5 h-5" /> Aportar Apunte
          </button>
        </div>
      </aside>

      {/* ÁREA CHAT */}
      <main className="flex-1 flex flex-col bg-[#0a0514]">
        <header className="p-6 border-b border-[#2d1b4d] bg-[#1a0b2e]/30 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-[#bb86fc]" />
          <h3 className="text-xl font-bold text-[#ccd6f6]">Chat de Discusión</h3>
        </header>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {mensajes.map((msj) => (
            <div key={msj.id} className={`flex gap-4 ${msj.soyYo ? 'flex-row-reverse' : ''}`}>
              {!msj.soyYo && <div className="w-8 h-8 rounded-full bg-[#2d1b4d] flex items-center justify-center text-[#bb86fc] font-bold shrink-0">{msj.emisor.charAt(0)}</div>}
              <div>
                <div className={`flex items-baseline gap-2 ${msj.soyYo ? 'justify-end' : ''}`}>
                  <span className={`font-bold ${msj.soyYo ? 'text-[#bb86fc]' : 'text-[#ccd6f6]'}`}>{msj.emisor}</span>
                  <span className="text-xs text-[#8892b0]">{msj.hora}</span>
                </div>
                <div className={`border p-3 mt-1 ${msj.soyYo ? 'bg-[#bb86fc]/10 border-[#bb86fc]/30 rounded-2xl rounded-tr-none text-[#ccd6f6]' : 'bg-[#1a0b2e] border-[#2d1b4d] rounded-2xl rounded-tl-none text-[#8892b0]'}`}>
                  {msj.texto}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={enviarMensaje} className="p-6 bg-[#0d0820] border-t border-[#2d1b4d]">
          <div className="flex items-center gap-3 bg-[#0a0514] border border-[#2d1b4d] rounded-xl p-2">
            <input 
              type="text" 
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..." 
              className="flex-1 bg-transparent border-none outline-none text-[#ccd6f6] px-2"
            />
            <button type="submit" className="bg-[#bb86fc] p-2 rounded-lg text-[#0a0514]">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
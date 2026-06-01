'use client'
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, ShieldCheck, MapPin, AlertTriangle, Check, X } from "lucide-react"

export default function ModeracionPage() {
  const router = useRouter()
  const [miCarrera, setMiCarrera] = useState("")

  // Simulamos la Base de Datos global de archivos en cuarentena
  const [documentosBD, setDocumentosBD] = useState([
    { id: 1, archivo: "Certamen_1.pdf", ramo: "Ingeniería de Software", carrera: "Ingeniería Civil Informática y Telecomunicaciones", autor: "luis@mail.udp.cl" },
    { id: 2, archivo: "Guia_Ejercicios.docx", ramo: "Termodinámica", carrera: "Ingeniería Industrial y Obras Civiles", autor: "maria@mail.udp.cl" },
    { id: 3, archivo: "Resumen_Final.pdf", ramo: "Bases de Datos", carrera: "Ingeniería Civil Informática y Telecomunicaciones", autor: "andres@mail.udp.cl" },
  ])

  useEffect(() => {
    // Obtenemos el "Tag" del usuario
    const savedCareer = localStorage.getItem("userCareer")
    if (savedCareer) setMiCarrera(savedCareer)
  }, [])

  // LÓGICA DE SEGURIDAD: Solo vemos los documentos que coinciden con nuestro Tag de carrera
  const documentosParaModerar = documentosBD.filter(doc => doc.carrera === miCarrera)

  const manejarResolucion = (id, accion) => {
    // Eliminamos de cuarentena visualmente
    setDocumentosBD(documentosBD.filter(doc => doc.id !== id))
    alert(`Archivo ${accion === 'aprobar' ? 'APROBADO (+10 Karma para ti y el autor)' : 'RECHAZADO'}.`)
  }

  return (
    <div className="min-h-screen bg-[#0a0514] p-8">
      <header className="mb-10 flex items-start justify-between">
        <div>
          <button onClick={() => router.push('/dashboard')} className="text-[#8892b0] flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
          </button>
          <h1 className="text-4xl font-bold text-[#ccd6f6] flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-[#ff00ff]" /> Panel de Moderación
          </h1>
          <p className="text-[#8892b0] mt-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Facultad de Ingeniería y Ciencias
          </p>
          <p className="text-[#bb86fc] mt-1 font-mono text-sm">Tag asignado: {miCarrera}</p>
        </div>
        
        <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 px-4 py-2 rounded-xl text-[#fbbf24] flex items-center gap-2 text-sm font-bold">
          <AlertTriangle className="w-4 h-4" /> {documentosParaModerar.length} Docs en Cuarentena para ti
        </div>
      </header>

      <div className="bg-[#0d0820] border border-[#2d1b4d] rounded-2xl overflow-hidden">
        {documentosParaModerar.length === 0 ? (
          <div className="p-12 text-center text-[#8892b0]">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-[#2d1b4d]" />
            <p className="text-xl">No hay documentos pendientes para tu carrera.</p>
            <p className="text-sm mt-2">¡Todo está al día!</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#1a0b2e] border-b border-[#2d1b4d]">
              <tr>
                <th className="p-4 text-[#8892b0] font-medium">Archivo</th>
                <th className="p-4 text-[#8892b0] font-medium">Ramo / Tag</th>
                <th className="p-4 text-[#8892b0] font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d1b4d]">
              {documentosParaModerar.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#1a0b2e]/50">
                  <td className="p-4 font-medium text-[#ccd6f6]">{doc.archivo}</td>
                  <td className="p-4 text-[#8892b0]">
                    <p className="text-[#ccd6f6]">{doc.ramo}</p>
                    <p className="text-xs bg-[#2d1b4d] inline-block px-2 py-1 rounded mt-1">{doc.carrera}</p>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => manejarResolucion(doc.id, 'aprobar')} className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => manejarResolucion(doc.id, 'rechazar')} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
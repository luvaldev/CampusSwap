'use client'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  MagnifyingGlass, Building, GraduationCap, FolderSimple,
  Compass, ArrowRight, CaretRight
} from "@phosphor-icons/react"

const FACULTADES = [
  { id: 'fae', nombre: 'Facultad de Administración y Economía', color: 'oklch(72% 0.15 160)' },
  { id: 'fad', nombre: 'Facultad de Arquitectura, Arte y Diseño', color: 'oklch(78% 0.15 85)' },
  { id: 'fcs', nombre: 'Facultad de Ciencias Sociales y Humanidades', color: 'oklch(70% 0.18 340)' },
  { id: 'fcl', nombre: 'Facultad de Comunicación y Letras', color: 'oklch(65% 0.15 290)' },
  { id: 'fde', nombre: 'Facultad de Derecho', color: 'oklch(65% 0.12 250)' },
  { id: 'fed', nombre: 'Facultad de Educación', color: 'oklch(65% 0.18 15)' },
  { id: 'fic', nombre: 'Facultad de Ingeniería y Ciencias', color: 'var(--brand)' },
  { id: 'fme', nombre: 'Facultad de Medicina', color: 'oklch(72% 0.12 175)' },
  { id: 'fps', nombre: 'Facultad de Psicología', color: 'oklch(70% 0.12 200)' },
  { id: 'fso', nombre: 'Facultad de Salud y Odontología', color: 'oklch(68% 0.1 220)' }
]

import { carrerasDB, cursosDB } from "../../data/database"

export default function Explorar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFacultad, setSelectedFacultad] = useState(null)
  const [selectedCarrera, setSelectedCarrera] = useState(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push('/')
  }, [status, router])

  if (status === "loading" || !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  const filteredFacultades = FACULTADES.filter(f => f.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  const carrerasDeFacultad = selectedFacultad ? carrerasDB.filter(c => c.facultyId === selectedFacultad.id) : []
  const filteredCarreras = carrerasDeFacultad.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  const cursosDeCarrera = selectedCarrera ? cursosDB.filter(curso => curso.carreras.includes(selectedCarrera.id)) : []
  const filteredCursos = cursosDeCarrera.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '4px' }}>Explorar Directorio UDP</p>
        <h1 className="page-title">
          {selectedCarrera ? selectedCarrera.nombre : selectedFacultad ? selectedFacultad.nombre : 'Todas las Facultades'}
        </h1>

        {(selectedFacultad || selectedCarrera) && (
          <div className="breadcrumb" style={{ flexWrap: 'wrap' }}>
            <button className="breadcrumb-item" onClick={() => { setSelectedFacultad(null); setSelectedCarrera(null); setSearchTerm(""); }}>
              Facultades
            </button>
            <CaretRight size={14} className="breadcrumb-separator" />
            {selectedFacultad && (
              <button
                className={`breadcrumb-item ${!selectedCarrera ? 'breadcrumb-item-active' : ''}`}
                onClick={() => { setSelectedCarrera(null); setSearchTerm(""); }}
              >
                {selectedFacultad.id.toUpperCase()}
              </button>
            )}
            {selectedCarrera && (
              <>
                <CaretRight size={14} className="breadcrumb-separator" />
                <span className="breadcrumb-item breadcrumb-item-active">{selectedCarrera.tag}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 'var(--space-6)', maxWidth: 500, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: 'var(--surface-2)', border: '1px solid var(--border-default)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)' }}>
          <MagnifyingGlass size={18} color="var(--brand)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder={`Buscar ${selectedCarrera ? 'ramos' : selectedFacultad ? 'carreras' : 'facultades'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'var(--font-sans)' }}
          />
        </div>
      </div>

      {/* LEVEL 1: FACULTIES */}
      {!selectedFacultad && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          {filteredFacultades.map(fac => (
            <div
              key={fac.id}
              onClick={() => { setSelectedFacultad(fac); setSearchTerm(""); }}
              className="card card-interactive"
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: fac.color }} />
              <div className="icon-box icon-box-lg" style={{ background: `color-mix(in oklch, ${fac.color} 15%, transparent)`, marginBottom: 'var(--space-4)' }}>
                <Building size={24} color={fac.color} />
              </div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, lineHeight: 1.3, marginBottom: 'var(--space-2)' }}>{fac.nombre}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: fac.color, fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                Explorar carreras <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEVEL 2: CAREERS */}
      {selectedFacultad && !selectedCarrera && (
        <>
          {carrerasDeFacultad.length === 0 ? (
            <div className="empty-state">
              <Building size={48} color="var(--text-muted)" style={{ marginBottom: 'var(--space-4)' }} />
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Próximamente</p>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>Estamos indexando las carreras y ramos de esta facultad.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
              {filteredCarreras.map(carrera => (
                <div
                  key={carrera.id}
                  onClick={() => { setSelectedCarrera(carrera); setSearchTerm(""); }}
                  className="card card-interactive"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                    <div className="icon-box icon-box-md" style={{ background: 'var(--brand-wash)' }}>
                      <GraduationCap size={20} color="var(--brand)" />
                    </div>
                    <span className="badge badge-neutral mono">{carrera.tag}</span>
                  </div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, lineHeight: 1.3, marginBottom: 'var(--space-3)' }}>{carrera.nombre}</h3>
                  <p style={{ color: 'var(--brand)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    Ver malla de ramos <ArrowRight size={14} />
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* LEVEL 3: COURSES */}
      {selectedCarrera && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {filteredCursos.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-10)' }}>No se encontraron ramos con ese nombre.</p>
          ) : (
            filteredCursos.map(curso => (
              <div
                key={curso.id}
                onClick={() => router.push(`/dashboard/curso/${curso.id}`)}
                className="card card-interactive"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)' }}
              >
                <div className="icon-box icon-box-md" style={{ background: 'var(--brand-wash)' }}>
                  <FolderSimple size={20} color="var(--brand)" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--brand)', fontWeight: 700, marginBottom: '2px' }}>{curso.id}</p>
                  <h4 className="truncate" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{curso.nombre}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: '2px' }}>{curso.creditos} Créditos Académicos</p>
                </div>
                <CaretRight size={16} color="var(--text-muted)" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
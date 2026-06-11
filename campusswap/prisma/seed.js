const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ==========================================
// 1. DATA ACTUALIZADA
// ==========================================
const FACULTADES = [
  { id: 'fae', nombre: 'Facultad de Administración y Economía' },
  { id: 'fad', nombre: 'Facultad de Arquitectura, Arte y Diseño' },
  { id: 'fcs', nombre: 'Facultad de Ciencias Sociales y Humanidades' },
  { id: 'fcl', nombre: 'Facultad de Comunicación y Letras' },
  { id: 'fde', nombre: 'Facultad de Derecho' },
  { id: 'fed', nombre: 'Facultad de Educación' },
  { id: 'fic', nombre: 'Facultad de Ingeniería y Ciencias' }, 
  { id: 'fme', nombre: 'Facultad de Medicina' },
  { id: 'fps', nombre: 'Facultad de Psicología' },
  { id: 'fso', nombre: 'Facultad de Salud y Odontología' }
];

const carrerasDB = [
  { id: "civ-obras", nombre: "Ingeniería Civil en Obras Civiles", tag: "CIV-OC" },
  { id: "civ-ind", nombre: "Ingeniería Civil Industrial", tag: "CIV-IND" },
  { id: "civ-inf", nombre: "Ingeniería Civil Informática", tag: "CIV-INF" }
];

const cursosDB = [
  // PLAN COMÚN
  { id: "CBM-1000", nombre: "Álgebra y Geometría", creditos: 12, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CBM-1001", nombre: "Cálculo I", creditos: 12, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CBQ-1000", nombre: "Química", creditos: 10, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CIT-1000", nombre: "Programación", creditos: 10, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "FIC-1000", nombre: "Comunicación para la Ingeniería", creditos: 8, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CBM-1002", nombre: "Álgebra Lineal", creditos: 10, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CBM-1003", nombre: "Cálculo II", creditos: 10, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CBF-1000", nombre: "Mecánica", creditos: 12, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CBM-1005", nombre: "Ecuaciones Diferenciales", creditos: 10, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CBM-1006", nombre: "Cálculo III", creditos: 10, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CBF-1001", nombre: "Calor y Ondas", creditos: 12, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CBE-2000", nombre: "Probabilidad y Estadística", creditos: 10, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CBF-1002", nombre: "Electricidad y Magnetismo", creditos: 12, carreras: ["civ-obras", "civ-ind", "civ-inf"] },

  // OBRAS CIVILES
  { id: "COC-2200", nombre: "Mecánica de Fluidos", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2100", nombre: "Estática", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2101", nombre: "Mecánica de Sólidos", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2102", nombre: "Análisis Estructural", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2103", nombre: "Diseño Estructural", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2201", nombre: "Hidráulica", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2204", nombre: "Hidrología", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2205", nombre: "Hidráulica Urbana", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2003", nombre: "Tecnología del Hormigón", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2105", nombre: "Diseño en Hormigón", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2107", nombre: "Diseño en Acero", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2004", nombre: "Administración de Proyectos Civiles", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2005", nombre: "Planificación de Proyectos", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-3000", nombre: "Ingeniería de Costos", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-3001", nombre: "Diseño de Caminos", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2104", nombre: "Mecánica de Suelos", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-2106", nombre: "Fundaciones", creditos: 10, carreras: ["civ-obras"] },
  { id: "FIC-10032", nombre: "BIM", creditos: 10, carreras: ["civ-obras"] },
  { id: "COC-33XX", nombre: "Taller de Proyectos", creditos: 12, carreras: ["civ-obras"] },
  { id: "COC-END", nombre: "Actividad de Titulación", creditos: 50, carreras: ["civ-obras"] },

  // INDUSTRIAL
  { id: "CII-2402", nombre: "Termodinámica", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2401", nombre: "Mecánica de Fluidos", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2101", nombre: "Microeconomía", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2002", nombre: "Ingeniería Económica", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2003", nombre: "Finanzas", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2100", nombre: "Introducción a la Economía", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-1001", nombre: "Teoría Organizacional", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2750", nombre: "Optimización", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2755", nombre: "Modelos Estocásticos", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2253", nombre: "Producción", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2254", nombre: "Logística", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2102", nombre: "Marketing", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2103", nombre: "Gestión Estratégica", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-2004", nombre: "Evaluación de Proyectos", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-3101", nombre: "Liderazgo y Emprendimiento", creditos: 10, carreras: ["civ-ind"] },
  { id: "CII-3102", nombre: "Taller de Ingeniería Industrial", creditos: 12, carreras: ["civ-ind"] },

  // INFORMÁTICA
  { id: "CIT-2006", nombre: "Estructura de Datos y Algoritmos", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-2007", nombre: "Bases de Datos", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-2009", nombre: "Bases de Datos Avanzadas", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-2109", nombre: "Arquitectura y Organización de Computadores", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-2010", nombre: "Sistemas Operativos", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-2111", nombre: "Comunicaciones Digitales", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-2112", nombre: "Tecnologías Inalámbricas", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-2113", nombre: "Criptografía y Seguridad en Redes", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-2012", nombre: "Ingeniería de Software", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-2100", nombre: "Introducción a la Economía", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-2207", nombre: "Evaluación de Proyectos TIC", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-3202", nombre: "Data Science", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-3203", nombre: "Proyectos en TICs II", creditos: 10, carreras: ["civ-inf"] },
  { id: "CIT-4002", nombre: "Actividad de Titulación", creditos: 10, carreras: ["civ-inf"] },

  // TRANSVERSALES
  { id: "ING-1", nombre: "Inglés I", creditos: 8, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "ING-2", nombre: "Inglés II", creditos: 8, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "ING-3", nombre: "Inglés III", creditos: 8, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CFG-1", nombre: "CFG 1", creditos: 8, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CFG-2", nombre: "CFG 2", creditos: 8, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CFG-3", nombre: "CFG 3", creditos: 8, carreras: ["civ-obras", "civ-ind", "civ-inf"] },
  { id: "CFG-4", nombre: "CFG 4", creditos: 8, carreras: ["civ-obras", "civ-ind", "civ-inf"] }
];

// ==========================================
// 2. LÓGICA DE INYECCIÓN
// ==========================================
async function main() {
  console.log('Iniciando la siembra de la Base de Datos')

  // A. Crear todas las Facultades
  for (const facultad of FACULTADES) {
    await prisma.faculty.upsert({
      where: { id: facultad.id },
      update: {},
      create: { id: facultad.id, name: facultad.nombre },
    })
  }
  console.log('Facultades creadas')

  // B. Crear las Carreras (Asociadas a la FIC)
  for (const carrera of carrerasDB) {
    await prisma.career.upsert({
      where: { id: carrera.id },
      update: {},
      create: { 
        id: carrera.id, 
        name: carrera.nombre, 
        tag: carrera.tag, 
        facultyId: 'fic' 
      },
    })
  }
  console.log('Carreras creadas')

  // C. Crear los Ramos y enlazarlos a las carreras múltiples
  for (const curso of cursosDB) {
    await prisma.course.upsert({
      where: { id: curso.id },
      update: {},
      create: {
        id: curso.id,
        name: curso.nombre,
        credits: curso.creditos,
        careers: {
          connect: curso.carreras.map(carreraId => ({ id: carreraId }))
        }
      },
    })
  }
  console.log('Ramos creados y enlazados')

  console.log('Base de datos sembrada con éxito')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
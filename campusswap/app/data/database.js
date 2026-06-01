// app/data/database.js

export const carrerasDB = [
  { 
    id: "civ-inf", 
    nombre: "Ingeniería Civil Informática y Telecomunicaciones", 
    tag: "CIV-INF" 
  },
  { 
    id: "ind-obr", 
    nombre: "Ingeniería Industrial", 
    tag: "IND-OBR" 
  }
];

export const cursosDB = [
  // Cursos de Informática
  { id: "isw", nombre: "Ingeniería de Software", creditos: 6, carreras: ["civ-inf"] },
  { id: "bd", nombre: "Bases de Datos", creditos: 6, carreras: ["civ-inf"] },
  { id: "arq", nombre: "Arquitectura de Computadores", creditos: 5, carreras: ["civ-inf"] },
  // Cursos Comunes (Plan Común)
  { id: "calc1", nombre: "Cálculo I", creditos: 8, carreras: ["civ-inf", "ind-obr"] },
  { id: "alg", nombre: "Álgebra Lineal", creditos: 6, carreras: ["civ-inf", "ind-obr"] },
  { id: "fismec", nombre: "Física Mecánica", creditos: 7, carreras: ["civ-inf", "ind-obr"] },
  // Cursos Industrial
  { id: "termo", nombre: "Termodinámica", creditos: 6, carreras: ["ind-obr"] },
  { id: "eco", nombre: "Economía", creditos: 5, carreras: ["ind-obr"] }
];
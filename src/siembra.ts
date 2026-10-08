const CONFIG = {
  primerIdProyecto: 1, // identificador correlativo sin unidad
  incrementoIdProyecto: 1, // identificador correlativo por proyecto
  semillaHash: 2166136261, // estado inicial del hash sin unidad
  multiplicadorHash: 16777619, // multiplicador del hash sin unidad
  multiplicadorAzar: 1664525, // multiplicador del generador sin unidad
  incrementoAzar: 1013904223, // incremento del generador sin unidad
  rangoAzar: 4294967296, // cantidad de estados posibles sin unidad
  desplazamientoUnsigned: 0, // desplazamiento de bits
} as const

type AptitudClimatica = 'verde' | 'amarillo' | 'rojo'

export type Zona = {
  nombre: string
  ubicacion: string
  aptitud: AptitudClimatica
  resumenClimatico: string
}

type Proyecto = {
  id: number
  zona: Zona
  cultivo: string
  recomendacion: string
  sembrado: boolean
  pasosSiembra: string[]
  seguimiento: string[]
}

export type Estado = {
  proyectos: Proyecto[]
  siguienteId: number
}

type DatosProyecto = {
  zona: Zona
  cultivo: string
  recomendacion: string
}

export function crearGeneradorAzar(semilla: string | number): () => number {
  let estado = CONFIG.semillaHash

  for (const caracter of String(semilla)) {
    estado =
      Math.imul(estado ^ caracter.charCodeAt(0), CONFIG.multiplicadorHash) >>>
      CONFIG.desplazamientoUnsigned
  }

  return () => {
    estado =
      (Math.imul(estado, CONFIG.multiplicadorAzar) + CONFIG.incrementoAzar) >>>
      CONFIG.desplazamientoUnsigned
    return estado / CONFIG.rangoAzar
  }
}

export function crearEstadoInicial(): Estado {
  return {
    proyectos: [],
    siguienteId: CONFIG.primerIdProyecto,
  }
}

export function crearProyecto(estado: Estado, datos: DatosProyecto): boolean {
  if (
    !datos.zona.nombre.trim() ||
    !datos.zona.ubicacion.trim() ||
    !datos.zona.resumenClimatico.trim() ||
    !datos.cultivo.trim() ||
    !datos.recomendacion.trim()
  ) {
    return false
  }

  estado.proyectos.push({
    id: estado.siguienteId,
    zona: { ...datos.zona },
    cultivo: datos.cultivo.trim(),
    recomendacion: datos.recomendacion.trim(),
    sembrado: false,
    pasosSiembra: [],
    seguimiento: [],
  })
  estado.siguienteId += CONFIG.incrementoIdProyecto
  return true
}

export function sembrar(estado: Estado, idProyecto: number, pasos: string[]): boolean {
  const proyecto = estado.proyectos.find(({ id }) => id === idProyecto)

  if (!proyecto || proyecto.sembrado || pasos.length === 0 || pasos.some((paso) => !paso.trim())) {
    return false
  }

  proyecto.pasosSiembra = pasos.map((paso) => paso.trim())
  proyecto.sembrado = true
  return true
}

export function registrarSeguimiento(estado: Estado, idProyecto: number, nota: string): boolean {
  const proyecto = estado.proyectos.find(({ id }) => id === idProyecto)

  if (!proyecto || !proyecto.sembrado || !nota.trim()) {
    return false
  }

  proyecto.seguimiento.push(nota.trim())
  return true
}
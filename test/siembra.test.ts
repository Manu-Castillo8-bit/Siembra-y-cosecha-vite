import { describe, expect, it } from 'vitest'
import {
  crearEstadoInicial,
  crearGeneradorAzar,
  crearProyecto,
  registrarSeguimiento,
  sembrar,
  type Zona,
} from '../src/siembra'

function crearZona(): Zona {
  return {
    nombre: 'Parcela norte',
    ubicacion: 'Región central',
    aptitud: 'verde',
    resumenClimatico: 'Lluvia favorable',
  }
}

function crearProyectoValido(estado = crearEstadoInicial()): ReturnType<typeof crearEstadoInicial> {
  crearProyecto(estado, {
    zona: crearZona(),
    cultivo: 'Maíz',
    recomendacion: 'Sembrar durante el período de lluvias.',
  })
  return estado
}

describe('generador de azar con semilla', () => {
  it('debería producir la misma secuencia para la misma semilla', () => {
    const secuenciaUno = Array.from({ length: 5 }, crearGeneradorAzar('lluvia'))
    const secuenciaDos = Array.from({ length: 5 }, crearGeneradorAzar('lluvia'))

    expect(secuenciaUno).toEqual(secuenciaDos)
  })

  it('debería producir secuencias distintas para semillas distintas', () => {
    const secuenciaUno = Array.from({ length: 5 }, crearGeneradorAzar('lluvia'))
    const secuenciaDos = Array.from({ length: 5 }, crearGeneradorAzar('sequía'))

    expect(secuenciaUno).not.toEqual(secuenciaDos)
  })
})

describe('crear proyectos de siembra', () => {
  it('debería crear un proyecto con los datos proporcionados', () => {
    const estado = crearEstadoInicial()
    const proyecto = {
      zona: crearZona(),
      cultivo: 'Maíz',
      recomendacion: 'Sembrar durante el período de lluvias.',
    }

    expect(crearProyecto(estado, proyecto)).toBe(true)
    expect(estado.proyectos).toHaveLength(1)
    expect(estado.proyectos[0]).toMatchObject({
      id: 1,
      zona: proyecto.zona,
      cultivo: proyecto.cultivo,
      recomendacion: proyecto.recomendacion,
      sembrado: false,
      pasosSiembra: [],
      seguimiento: [],
    })
  })

  it('debería rechazar un proyecto con datos obligatorios vacíos', () => {
    const estado = crearEstadoInicial()

    expect(crearProyecto(estado, {
      zona: { ...crearZona(), nombre: ' ' },
      cultivo: 'Maíz',
      recomendacion: 'Recomendación',
    })).toBe(false)
    expect(estado.proyectos).toHaveLength(0)
  })
})

describe('sembrar un proyecto', () => {
  it('debería guardar los pasos y marcar el proyecto como sembrado', () => {
    const estado = crearProyectoValido()

    expect(sembrar(estado, 1, [' Preparar el suelo ', 'Colocar las semillas'])).toBe(true)
    expect(estado.proyectos[0]).toMatchObject({
      sembrado: true,
      pasosSiembra: ['Preparar el suelo', 'Colocar las semillas'],
    })
  })

  it('debería rechazar la siembra cuando no hay un proyecto disponible', () => {
    const estado = crearEstadoInicial()

    expect(sembrar(estado, 1, ['Preparar el suelo'])).toBe(false)
    expect(estado.proyectos).toHaveLength(0)
  })

  it('debería rechazar pasos vacíos o volver a sembrar el mismo proyecto', () => {
    const estado = crearProyectoValido()

    expect(sembrar(estado, 1, [])).toBe(false)
    expect(sembrar(estado, 1, [' '])).toBe(false)
    expect(sembrar(estado, 1, ['Preparar el suelo'])).toBe(true)
    expect(sembrar(estado, 1, ['Sembrar de nuevo'])).toBe(false)
  })
})

describe('registrar seguimiento', () => {
  it('debería agregar una nota a un proyecto ya sembrado', () => {
    const estado = crearProyectoValido()
    sembrar(estado, 1, ['Preparar el suelo'])

    expect(registrarSeguimiento(estado, 1, ' Regar la parcela ')).toBe(true)
    expect(estado.proyectos[0].seguimiento).toEqual(['Regar la parcela'])
  })

  it('debería rechazar el seguimiento si no hay proyecto sembrado o la nota está vacía', () => {
    const estado = crearProyectoValido()

    expect(registrarSeguimiento(estado, 1, 'Nota')).toBe(false)
    sembrar(estado, 1, ['Preparar el suelo'])
    expect(registrarSeguimiento(estado, 1, ' ')).toBe(false)
    expect(estado.proyectos[0].seguimiento).toHaveLength(0)
  })
})
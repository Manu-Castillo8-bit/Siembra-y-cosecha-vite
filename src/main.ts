import './style.css'
import {
  crearEstadoInicial,
  crearProyecto,
  registrarSeguimiento,
  sembrar,
  type Estado,
  type Zona,
} from './siembra.ts'

const contenedor = document.querySelector<HTMLDivElement>('#app')

if (!contenedor) {
  throw new Error('No se encontró el contenedor de la aplicación.')
}

const app: HTMLDivElement = contenedor

let estado: Estado = crearEstadoInicial()
let proyectoActivoId: number | null = null

const nombresAptitud: Record<Zona['aptitud'], string> = {
  verde: 'Apta',
  amarillo: 'Precaución',
  rojo: 'Riesgosa',
}

function escapar(texto: string): string {
  return texto.replace(/[&<>"']/g, (caracter) => {
    const entidades: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entidades[caracter] ?? caracter
  })
}

function dibujarMarco(contenido: string, etapa: number): void {
  app.innerHTML = `
    <div class="app-frame">
      <header class="topbar">
        <a class="brand" href="#inicio" aria-label="Siembra y cosecha, inicio">
          <span class="brand-mark" aria-hidden="true">S</span>
          <span>SIEMBRA <span class="brand-divider">/</span> COSECHA</span>
        </a>
        ${etapa > 1 ? '<button class="text-button" type="button" data-nuevo>Nuevo plan <span aria-hidden="true">+</span></button>' : ''}
      </header>
      <ol class="journey" aria-label="Etapas del plan de siembra">
        <li class="${etapa === 1 ? 'is-current' : 'is-complete'}" ${etapa === 1 ? 'aria-current="step"' : ''}>
          <span class="journey-number">01</span><span>Plan</span>
        </li>
        <li class="${etapa === 2 ? 'is-current' : etapa > 2 ? 'is-complete' : ''}" ${etapa === 2 ? 'aria-current="step"' : ''}>
          <span class="journey-number">02</span><span>Siembra</span>
        </li>
        <li class="${etapa === 3 ? 'is-current' : ''}" ${etapa === 3 ? 'aria-current="step"' : ''}>
          <span class="journey-number">03</span><span>Seguimiento</span>
        </li>
      </ol>
      ${contenido}
      <footer class="page-footer">
        <span>SIEMBRA Y COSECHA</span>
        <span>Un plan a la vez, una cosecha a la vez.</span>
      </footer>
    </div>
  `

  app.querySelector<HTMLButtonElement>('[data-nuevo]')?.addEventListener('click', () => {
    proyectoActivoId = null
    dibujar()
  })
}

function dibujarInicio(): void {
  dibujarMarco(`
    <main class="start-layout" id="inicio">
      <section class="intro-panel" aria-labelledby="titulo-inicio">
        <p class="eyebrow"><span class="eyebrow-line"></span>PLANIFICACIÓN DE CAMPAÑA</p>
        <h1 id="titulo-inicio" tabindex="-1">Primero, leer el cielo.</h1>
        <p class="intro-copy">Un buen comienzo nace de conocer la tierra, la lluvia y lo que querés sembrar.</p>
        <div class="season-note">
          <span class="season-mark" aria-hidden="true">01</span>
          <p>Prepará el plan con las condiciones de tu zona.</p>
        </div>
        <div class="aptitude-key" aria-label="Clasificación de aptitud climática">
          <span><i class="signal signal--verde"></i>Apto</span>
          <span><i class="signal signal--amarillo"></i>Precaución</span>
          <span><i class="signal signal--rojo"></i>Riesgoso</span>
        </div>
      </section>

      <section class="form-panel" aria-labelledby="titulo-formulario">
        <div class="section-heading">
          <p class="eyebrow">NUEVO PROYECTO</p>
          <h2 id="titulo-formulario">Tu próximo sembrado</h2>
          <p>Completá los datos de la zona y el cultivo.</p>
        </div>
        <form id="form-plan" class="form-grid">
          <label class="field" for="zona-nombre">
            <span>Nombre de la zona</span>
            <input id="zona-nombre" name="zona" autocomplete="off" placeholder="Ej. Parcela norte" required />
          </label>
          <label class="field" for="zona-ubicacion">
            <span>Ubicación</span>
            <input id="zona-ubicacion" name="ubicacion" autocomplete="address-level2" placeholder="Localidad o región" required />
          </label>
          <label class="field" for="zona-aptitud">
            <span>Aptitud climática</span>
            <select id="zona-aptitud" name="aptitud" required>
              <option value="" selected disabled>Elegí una condición</option>
              <option value="verde">Verde · apto</option>
              <option value="amarillo">Amarillo · precaución</option>
              <option value="rojo">Rojo · riesgoso</option>
            </select>
          </label>
          <label class="field" for="resumen-clima">
            <span>Condición de lluvia</span>
            <textarea id="resumen-clima" name="clima" rows="2" placeholder="Resumen del clima de la zona" required></textarea>
          </label>
          <label class="field" for="cultivo">
            <span>Qué querés sembrar</span>
            <input id="cultivo" name="cultivo" autocomplete="off" placeholder="Nombre del cultivo" required />
          </label>
          <label class="field" for="recomendacion">
            <span>Recomendación para este período</span>
            <textarea id="recomendacion" name="recomendacion" rows="2" placeholder="Plan o recomendación para la zona" required></textarea>
          </label>
          <p class="form-error" data-error role="alert" aria-live="polite"></p>
          <button class="primary-button" type="submit">Crear plan <span aria-hidden="true">→</span></button>
        </form>
      </section>
    </main>
  `, 1)

  app.querySelector<HTMLFormElement>('#form-plan')?.addEventListener('submit', (evento) => {
    evento.preventDefault()
    const formulario = evento.currentTarget
    if (!(formulario instanceof HTMLFormElement)) return
    const datos = new FormData(formulario)
    const zona: Zona = {
      nombre: String(datos.get('zona') ?? ''),
      ubicacion: String(datos.get('ubicacion') ?? ''),
      aptitud: String(datos.get('aptitud') ?? '') as Zona['aptitud'],
      resumenClimatico: String(datos.get('clima') ?? ''),
    }
    const creado = crearProyecto(estado, {
      zona,
      cultivo: String(datos.get('cultivo') ?? ''),
      recomendacion: String(datos.get('recomendacion') ?? ''),
    })

    if (!creado) {
      mostrarError('No se pudo crear el plan. Revisá los datos e intentá otra vez.')
      return
    }

    proyectoActivoId = estado.proyectos.at(-1)?.id ?? null
    dibujar()
  })
}

function dibujarEnCurso(proyecto: Estado['proyectos'][number]): void {
  dibujarMarco(`
    <main class="work-layout" id="inicio">
      <section class="work-heading" aria-labelledby="titulo-curso">
        <p class="eyebrow"><span class="eyebrow-line"></span>PLAN EN MARCHA</p>
        <h1 id="titulo-curso" tabindex="-1">${escapar(proyecto.cultivo)}<span class="title-period">.</span></h1>
        <p class="intro-copy">${escapar(proyecto.zona.nombre)} · ${escapar(proyecto.zona.ubicacion)}</p>
        <div class="condition-row">
          <span class="condition-pill condition--${proyecto.zona.aptitud}"><i class="signal signal--${proyecto.zona.aptitud}"></i>${nombresAptitud[proyecto.zona.aptitud]}</span>
          <span>${escapar(proyecto.zona.resumenClimatico)}</span>
        </div>
        <div class="recommendation">
          <span class="recommendation-label">PLAN DEL PERÍODO</span>
          <p>${escapar(proyecto.recomendacion)}</p>
        </div>
      </section>

      <section class="form-panel sowing-panel" aria-labelledby="titulo-siembra">
        <div class="section-heading">
          <p class="eyebrow">SIGUIENTE PASO</p>
          <h2 id="titulo-siembra">Preparar la siembra</h2>
          <p>Agregá cada paso en una línea.</p>
        </div>
        <form id="form-siembra" class="form-grid">
          <label class="field" for="pasos-siembra">
            <span>Paso a paso</span>
            <textarea id="pasos-siembra" name="pasos" rows="5" placeholder="Preparar el terreno&#10;Sembrar las semillas&#10;Regar" required></textarea>
          </label>
          <p class="form-error" data-error role="alert" aria-live="polite"></p>
          <button class="primary-button" type="submit">Sembrar <span aria-hidden="true">→</span></button>
        </form>
      </section>
    </main>
  `, 2)

  app.querySelector<HTMLFormElement>('#form-siembra')?.addEventListener('submit', (evento) => {
    evento.preventDefault()
    const formulario = evento.currentTarget
    if (!(formulario instanceof HTMLFormElement)) return
    const pasos = String(new FormData(formulario).get('pasos') ?? '').split(/\r?\n/)

    if (!sembrar(estado, proyecto.id, pasos)) {
      mostrarError('No se pudo registrar la siembra. Revisá los pasos e intentá otra vez.')
      return
    }

    dibujar()
  })
}

function dibujarFinal(proyecto: Estado['proyectos'][number]): void {
  dibujarMarco(`
    <main class="final-layout" id="inicio">
      <section class="final-heading" aria-labelledby="titulo-final">
        <p class="eyebrow"><span class="eyebrow-line"></span>SIEMBRA REGISTRADA</p>
        <h1 id="titulo-final" tabindex="-1">La tierra ya está en marcha<span class="title-period">.</span></h1>
        <p class="intro-copy">${escapar(proyecto.cultivo)} · ${escapar(proyecto.zona.nombre)}, ${escapar(proyecto.zona.ubicacion)}</p>
        <div class="condition-row">
          <span class="condition-pill condition--${proyecto.zona.aptitud}"><i class="signal signal--${proyecto.zona.aptitud}"></i>${nombresAptitud[proyecto.zona.aptitud]}</span>
          <span>${escapar(proyecto.zona.resumenClimatico)}</span>
        </div>
      </section>

      <section class="final-content" aria-label="Plan y seguimiento">
        <div class="steps-panel">
          <div class="section-heading">
            <p class="eyebrow">PASO A PASO</p>
            <h2>Plan de siembra</h2>
          </div>
          <ol class="sowing-list">
            ${proyecto.pasosSiembra.map((paso, indice) => `
              <li><span class="list-number">${String(indice + 1).padStart(2, '0')}</span><span>${escapar(paso)}</span></li>
            `).join('')}
          </ol>
          <p class="recommendation-label final-recommendation">${escapar(proyecto.recomendacion)}</p>
        </div>

        <div class="tracking-panel">
          <div class="section-heading">
            <p class="eyebrow">BITÁCORA</p>
            <h2>Seguimiento</h2>
          </div>
          <ol class="tracking-list">
            ${proyecto.seguimiento.length
              ? proyecto.seguimiento.map((nota) => `<li>${escapar(nota)}</li>`).join('')
              : '<li class="empty-note">Todavía no hay registros.</li>'}
          </ol>
          <form id="form-seguimiento" class="tracking-form">
            <label class="field" for="nota-seguimiento">
              <span>Agregar una observación</span>
              <textarea id="nota-seguimiento" name="nota" rows="2" placeholder="Riego, brotes, lluvia…" required></textarea>
            </label>
            <p class="form-error" data-error role="alert" aria-live="polite"></p>
            <button class="secondary-button" type="submit">Guardar registro <span aria-hidden="true">+</span></button>
          </form>
        </div>
      </section>
    </main>
  `, 3)

  app.querySelector<HTMLFormElement>('#form-seguimiento')?.addEventListener('submit', (evento) => {
    evento.preventDefault()
    const formulario = evento.currentTarget
    if (!(formulario instanceof HTMLFormElement)) return
    const nota = String(new FormData(formulario).get('nota') ?? '')

    if (!registrarSeguimiento(estado, proyecto.id, nota)) {
      mostrarError('No se pudo guardar el registro. Revisá el texto e intentá otra vez.')
      return
    }

    dibujar()
  })
}

function mostrarError(mensaje: string): void {
  const error = app.querySelector<HTMLElement>('[data-error]')
  if (error) error.textContent = mensaje
}

function dibujar(): void {
  const proyecto = estado.proyectos.find(({ id }) => id === proyectoActivoId)

  if (!proyecto) {
    dibujarInicio()
  } else if (proyecto.sembrado) {
    dibujarFinal(proyecto)
  } else {
    dibujarEnCurso(proyecto)
  }
}

dibujar()

# Siembra y Cosecha

Aplicación web para organizar un plan de siembra según la zona, las condiciones de lluvia y una recomendación para el período. Permite registrar los pasos de siembra y agregar observaciones para dar seguimiento al cultivo.

## Funcionalidades

- Crear un plan con zona, ubicación, aptitud climática, resumen de lluvia, cultivo y recomendación.
- Registrar los pasos necesarios para sembrar.
- Llevar una bitácora con observaciones de seguimiento.
- Mostrar la aptitud climática con una clasificación visual: verde (apta), amarillo (precaución) y rojo (riesgosa).
- Usar la aplicación desde pantallas grandes y dispositivos móviles.

## Uso

1. Completá los datos de la zona y del cultivo para crear un plan.
2. Escribí los pasos de siembra, uno por línea, y seleccioná **Sembrar**.
3. En la pantalla de seguimiento, agregá observaciones como riegos, brotes o lluvia.

La aptitud climática y la recomendación se ingresan en el formulario. La aplicación no las calcula automáticamente.

## Requisitos

- Node.js
- npm

## Instalación y desarrollo

```bash
npm install
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación.

## Pruebas y compilación

```bash
npm test
npm run test:watch
npm run build
```

Las pruebas de Vitest se encuentran en `test/` y usan archivos con el patrón `*.test.ts`.

## Tecnologías

- TypeScript
- Vite
- Vitest
- CSS

## Estructura principal

- `src/main.ts`: presenta las pantallas y conecta los formularios con las funciones de siembra.
- `src/siembra.ts`: contiene los tipos, el estado de los proyectos y las operaciones de crear, sembrar y registrar seguimiento.
- `src/style.css`: estilos adaptables a distintos tamaños de pantalla.
- `test/siembra.test.ts`: pruebas del generador con semilla y del flujo de proyectos.

## Alcance actual

La aplicación no consulta una API meteorológica ni utiliza inteligencia artificial. Tampoco guarda los proyectos de forma permanente: el estado se mantiene en memoria y se pierde al recargar la página. La recomendación, el resumen climático y la aptitud deben ingresarse manualmente.
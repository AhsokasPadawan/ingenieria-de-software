# Ingeniería de Software — Plataforma de Estudio

Plataforma web interactiva para la materia **Ingeniería de Software**, con diapositivas teóricas, visualizadores de conceptos, apuntes descargables en PDF y un entorno de práctica integrado.

## Características principales

- **Diapositivas por unidad**: Navegación por módulos y subtemas con soporte para fórmulas matemáticas ([KaTeX](https://katex.org/)) y diagramas ([Mermaid](https://mermaid.js.org/)).
- **Visualizadores interactivos**: Simuladores paso a paso de arquitecturas (Capas, Hexagonal, ECS), patrones (*Command*, Inyección de Dependencias), gestión de memoria (*Object Pool* vs. GC, fugas con `Dispose`), matriz de riesgos y cadenas de auditoría HMAC.
- **Práctica y pizarrón**: Banco de ejercicios prácticos y tareas con editor de pseudocódigo, código y texto plano, más un pizarrón digital con herramientas de dibujo (lápiz libre, rectángulo, círculo, triángulo, flecha, línea, caja de texto y borrador), deshacer/rehacer y exportación a PNG.
- **Apuntes PDF**: Acceso directo a los apuntes de cada unidad desde la barra lateral.
- **Buscador global y preferencias**: Búsqueda rápida de contenidos, seguimiento de progreso, cambio de tema claro/nocturno y persistencia automática de borradores y trazos en `localStorage`.

## Stack tecnológico

- **Frontend**: React 18, TypeScript, Vite 6, Tailwind CSS 4
- **UI y diagramas**: Lucide React, Framer Motion, KaTeX, Mermaid
- **Testing**: Vitest, Testing Library, jsdom

## Requisitos y uso local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Levanta el servidor de desarrollo con Vite. |
| `npm run build` | Verifica tipos con `tsc -b` y genera el bundle de producción en `dist/`. |
| `npm run preview` | Sirve localmente la build generada en `dist/`. |
| `npm test` | Ejecuta la suite de tests con Vitest. |
| `npm run typecheck` | Ejecuta la verificación de tipos TypeScript sin emitir archivos. |

## Estructura del proyecto

```text
├── apuntes/        # Apuntes de la materia en formato PDF
├── ejercicios/     # Material y enunciados de práctica
├── teoria/         # Contenidos teóricos estructurados en JSON por unidad
└── src/
    ├── core/       # Motor de la plataforma (dominio, shell, sidebar, slides, práctica y pizarrón)
    └── course/     # Datos del curso, componentes de diapositivas y visualizadores interactivos
```

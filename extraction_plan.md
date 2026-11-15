# EXTRACTION_PLAN.md — Ingeniería de Software (UADE)

Plan maestro de integración para **Antigravity** sobre la arquitectura `clases-slides-templates` (`src/course/` aislado de `src/core/`).

## 1. Inventario de archivos JSON regenerados

### Teoría (`teoria/`) — Esquema tipado de 4 pesos visuales (`bloques[]`)
Todos los archivos siguen estrictamente la jerarquía de 4 pesos (`tema` → `conceptos[].nombre` → `definicion` → `items` con `etiqueta` / `etiqueta_items`), sin Markdown libre, con `diagrama_mermaid` y `tabla` nativos, y con slides atómicas 16:9 sin scroll:

| Unidad | Archivo | Clases | Lenguaje de código (`codigo`) |
| :--- | :--- | :--- | :--- |
| **00** | `teoria_00_repaso_y_arquitecturas.json` | 0 y 0.1 | `null` (conceptual) |
| **01** | `teoria_01_ingenio_y_diseno.json` | 1, 2, 3 y 4 | **C#** (SOLID, 4 niveles DI, Composición, Strategy, State, Command, Testabilidad, Doubles, AAA, TDD) |
| **03** | `teoria_03_bpo_y_sla.json` | 5 | `null` (conceptual) |
| **04** | `teoria_04_optimizacion_cpu_y_memoria.json` | 6 y 7 | **C#** (10 regiones de CPU + 6 regiones de Memoria RAM, 1 slide por técnica) |
| **05** | `teoria_05_gobernanza_it_y_riesgos.json` | 8 | **C#** (Bonus: IA como asesora de ajedrez con decisiones `[GOBERNANZA]`) |
| **06** | `teoria_06_auditoria_metricas_etica_integridad.json` | 9 | **Java 17+** (Bonus: SHA-256 y cadena `AuditLog` con `HmacSHA256`) |

### Práctica (`ejercicios/`) — Texto plano limpio + pestañas separadas
- **`ejercicios_unidad_00.json`**, **`ejercicios_unidad_01.json`**, **`ejercicios_unidad_03.json`**, **`ejercicios_unidad_04.json`**, **`ejercicios_unidad_05.json`**, **`ejercicios_unidad_06.json`**: `fuente_original` sin `"Tarea"`/`"Teams"` → etiquetar como **Práctica de Unidad**.
- **`tareas_unidad_01.json`**, **`tareas_unidad_03.json`**, **`tareas_unidad_04.json`**, **`tareas_unidad_05.json`**: `fuente_original` con `"Tarea en Teams"` → etiquetar como **Entrega Obligatoria**. *(Unidades 00 y 06 no tienen consignas de Tarea).*

---

## 2. Contrato de renderizado para Antigravity

1. **Renderizador de `bloques[]` (4 pesos visuales):**
   - Peso 1: `tema` (título principal del bloque).
   - Peso 2: `conceptos[].nombre` (tarjetas según `layout_conceptos`: `grid-2`, `grid-3` o `lista`).
   - Peso 3: `definicion` (subtítulo breve del tema o concepto).
   - Peso 4: `conceptos[].items` / `detalles.items` con su `etiqueta_items` / `detalles.etiqueta`.
   - `diagrama_mermaid`: renderizar directo con Mermaid (sin fences ```` ``` ````).
   - `tabla`: renderizar tabla nativa a partir de `columnas` y `filas`.
   - `conclusion`: caja destacada de cierre al pie del bloque.
2. **Pizarrón multi-lenguaje:** agregar soporte/resaltado para **C#** (`csharp` en Unidades 01, 04 y 05) y **Java** (`java` en Unidad 06).
3. **Dos pestañas en práctica:** separar visualmente **Ejercicios Prácticos** (`ejercicios_unidad_XX.json`) y **Tareas** (`tareas_unidad_XX.json`).

---

## 3. Catálogo de visualizadores interactivos (`src/course/visualizers/`)

Registrar en `courseBlockRegistry.tsx` usando `useVisualizerPlayback`, paradigma funcional y Lookup Tables:

| Unidad | Componente | Simulación / Interactividad |
| :--- | :--- | :--- |
| **00** | `ArchitectureFlowVisualizer` | Selector entre **Capas**, **Hexagonal** y **ECS** animando hacia dónde apuntan las dependencias. |
| **01** | `ChessCommandAndDiVisualizer` | Paso a paso de `MoveCommand.Execute()` y `Undo()` con captura + evolución de los **4 niveles de DI**. |
| **03** | `WeightedVendorMatrixVisualizer` | Calculadora interactiva de **Matriz de Decisión Ponderada** (Costo/Calidad/Soporte) y regla *Core vs. Commodity*. |
| **04** | `ObjectPoolAndMemoryVisualizer` | Simulación de **Object Pool** (`Get()` / `Return()`) vs. presión de **GC en Heap**, y fuga por evento sin `Dispose()`. |
| **05** | `RiskMatrixAndAdvisorVisualizer` | **Matriz de Riesgos** interactiva (Probabilidad × Impacto) + flujo de validación y respaldo de `AdvisedMoveSelector`. |
| **06** | `HmacAuditChainVisualizer` | Cadena de **AuditLog (`HmacSHA256`)** donde se edita o borra una fila y se ve cómo se rompe `firstBrokenEntry()`. |

---

## 4. Plan de sesiones para Antigravity

- **Sesión 1 — Base, datos y renderizador de 4 pesos:** copiar los JSON en `teoria/` y `ejercicios/`, actualizar tipos e interfaces para `bloques[]` (4 pesos, `diagrama_mermaid`, `tabla`, `conclusion`), habilitar resaltado **C# / Java** en el pizarrón y separar pestañas **Ejercicios Prácticos** y **Tareas**.
- **Sesión 2 — Visualizadores Unidades 00, 01 y 03:** implementar `ArchitectureFlowVisualizer`, `ChessCommandAndDiVisualizer` y `WeightedVendorMatrixVisualizer` en `src/course/visualizers/`.
- **Sesión 3 — Visualizadores Unidades 04, 05 y 06:** implementar `ObjectPoolAndMemoryVisualizer`, `RiskMatrixAndAdvisorVisualizer` y `HmacAuditChainVisualizer`.
- **Sesión 4 — Pulido, tests y build:** conectar todo en `courseBlockRegistry.tsx`, verificar 16:9 sin scroll en todas las slides y pasar `npm test` y `npm run build`.

---

## 5. Prompt de arranque para Antigravity (Sesión 1)

```text
Lee EXTRACTION_PLAN.md en la raíz del proyecto.
En esta Sesión 1 necesitamos:
1. Registrar los nuevos archivos JSON regenerados en teoria/ (teoria_00 a teoria_06) y ejercicios/ (ejercicios_unidad_00..06 y tareas_unidad_01, 03, 04, 05) dentro de src/course/data/.
2. Actualizar el renderizador de slides para soportar el esquema tipado de 4 pesos visuales en bloques[] (tema, conceptos[].nombre según layout_conceptos, definicion, items con etiqueta/etiqueta_items, diagrama_mermaid, tabla y conclusion), asegurando que cada slide entre en 16:9 sin scroll.
3. Extender el pizarrón de código para soportar C# (Unidades 01, 04 y 05) y Java (Unidad 06).
4. Separar la vista práctica en dos pestañas: "Ejercicios Prácticos" (Práctica de Unidad) y "Tareas" (Entrega Obligatoria).
Respetá el aislamiento de src/core/, usá paradigma funcional con Lookup Tables en lugar de switch, sin comentarios innecesarios, y verificá que npm test y npm run build pasen al finalizar.
```

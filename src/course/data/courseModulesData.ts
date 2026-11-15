import rawTheory00 from '../../../teoria/teoria_00_repaso_y_arquitecturas.json';
import rawTheory01 from '../../../teoria/teoria_01_ingenio_y_diseno.json';
import rawTheory03 from '../../../teoria/teoria_03_bpo_y_sla.json';
import rawTheory04 from '../../../teoria/teoria_04_optimizacion_cpu_y_memoria.json';
import rawTheory05 from '../../../teoria/teoria_05_gobernanza_it_y_riesgos.json';
import rawTheory06 from '../../../teoria/teoria_06_auditoria_metricas_etica_integridad.json';
import {
  ConceptSlide,
  ModuleMetadata,
  ModuleStudyData,
} from '../../core/domain/coreTypes';
import { parseRawTheoryModuleData } from '../../core/domain/jsonCourseProcessor';
import { registerModuleThemePalettes } from '../../core/domain/sectionThemes';
import {
  buildSlideDeck,
  ModuleOpeningQuoteSpec,
  SlideVisualizerBinding,
} from '../../core/domain/slideDeckBuilder';
import {
  buildStudySearchIndex,
  SearchableStudyEntry,
} from '../../core/domain/studySearch';
import { COURSE_TASKS_LIST, EXAM_EXERCISES_LIST } from './examExercisesData';

export const PRACTICE_MODULE_ID = 'module-practice';

registerModuleThemePalettes({
  'module-0-repaso': 'indigo',
  'module-1-ingenio': 'sky',
  'module-3-bpo-sla': 'emerald',
  'module-4-optimizacion': 'amber',
  'module-5-gobernanza': 'violet',
  'module-6-auditoria': 'rose',
  'module-practice': 'fuchsia',
});

export const MODULE_NAVIGATION_LIST: ModuleMetadata[] = [
  {
    id: 'module-0-repaso',
    numberLabel: '0',
    sidebarTitle: '0. Repaso y Arquitecturas',
    headerTitle: 'Unidad 00: Repaso General y Tipos de Arquitectura',
    subtitle:
      'Fundamentos de programación, POO, SOLID, patrones de diseño, escalabilidad y comparación de arquitecturas (Capas, Hexagonal y ECS).',
    contractTag: 'IArchitectureCore',
    keyTakeaway:
      'La arquitectura define la dirección de las dependencias: aislar el dominio de los detalles externos permite escalar y mantener el sistema.',
  },
  {
    id: 'module-1-ingenio',
    numberLabel: '1',
    sidebarTitle: '1. Ingenio y Diseño',
    headerTitle: 'Unidad 01: Ingenio y Diseño de Software',
    subtitle:
      'Requisitos, principio rector, sobre-ingeniería, frontera dominio/framework, arquitectura hexagonal, SOLID, DI, State y Command en C#.',
    contractTag: 'IDomainDesign',
    keyTakeaway:
      'El buen diseño equilibra simplicidad con extensibilidad, introduciendo abstracciones solo donde la variabilidad del dominio lo justifica.',
  },
  {
    id: 'module-3-bpo-sla',
    numberLabel: '3',
    sidebarTitle: '3. BPO y SLA como Contrato',
    headerTitle: 'Unidad 03: Tercerización (BPO) y SLA como Contrato',
    subtitle:
      'Criterios de tercerización (Core vs. Commodity), SLIs, SLOs, SLAs, evaluación ponderada de proveedores y Software Factory.',
    contractTag: 'IServiceLevelAgreement',
    keyTakeaway:
      'Un SLA traduce expectativas de negocio en métricas verificables y responsabilidades contractuales claras entre cliente y proveedor.',
  },
  {
    id: 'module-4-optimizacion',
    numberLabel: '4',
    sidebarTitle: '4. Optimización CPU y RAM',
    headerTitle: 'Unidad 04: Optimización de CPU y Memoria',
    subtitle:
      'Regla de Knuth, Big O, profiling, técnicas de optimización de CPU, Heap vs. Stack, Garbage Collector, Object Pool y Dispose en C#.',
    contractTag: 'IPerformanceTuning',
    keyTakeaway:
      'La optimización prematura es la raíz de todo mal: medir primero con herramientas de profiling y optimizar únicamente la ruta crítica.',
  },
  {
    id: 'module-5-gobernanza',
    numberLabel: '5',
    sidebarTitle: '5. Gobernanza IT y Riesgos',
    headerTitle: 'Unidad 05: Gobernanza de IT y Gestión de Riesgos',
    subtitle:
      'Gobernanza vs. Gestión, COBIT/ITIL/ISO, políticas y normativas, matriz de riesgos (Probabilidad × Impacto) y adaptadores con fallback en C#.',
    contractTag: 'ITGovernance',
    keyTakeaway:
      'Gobernar tecnología implica alinear las decisiones técnicas y la gestión de riesgos con los objetivos estratégicos del negocio.',
  },
  {
    id: 'module-6-auditoria',
    numberLabel: '6',
    sidebarTitle: '6. Auditoría, Ética e Integridad',
    headerTitle: 'Unidad 06: Auditoría, Métricas, Ética e Integridad',
    subtitle:
      'Auditoría y trazabilidad, KPIs y KRIs, Ley de Goodhart, ética profesional, caso Volkswagen y cadena de auditoría HMAC-SHA256 en Java.',
    contractTag: 'IAuditIntegrity',
    keyTakeaway:
      'Las métricas mal diseñadas distorsionan el comportamiento; la trazabilidad criptográfica y la ética profesional protegen la integridad del sistema.',
  },
  {
    id: PRACTICE_MODULE_ID,
    numberLabel: 'P',
    sidebarTitle: 'Práctica: Ejercicios y Tareas',
    headerTitle: 'Práctica de Ingeniería de Software — Ejercicios y Tareas',
    subtitle:
      'Resolución guiada de ejercicios por unidad y entregas de tareas con pizarrón interactivo en C#, Java, Python y Pseudocódigo.',
    contractTag: 'IPracticeWorkspace',
    keyTakeaway:
      'Consolidar los principios de diseño, arquitectura, rendimiento y gobernanza aplicándolos en casos concretos de la cátedra.',
  },
];

const NAVIGATION_METADATA_BY_MODULE_ID: Record<string, ModuleMetadata> = {
  'module-0-repaso': MODULE_NAVIGATION_LIST[0],
  'module-1-ingenio': MODULE_NAVIGATION_LIST[1],
  'module-3-bpo-sla': MODULE_NAVIGATION_LIST[2],
  'module-4-optimizacion': MODULE_NAVIGATION_LIST[3],
  'module-5-gobernanza': MODULE_NAVIGATION_LIST[4],
  'module-6-auditoria': MODULE_NAVIGATION_LIST[5],
};

export const STUDY_MODULES_BY_ID: Record<string, ModuleStudyData> = {
  'module-0-repaso': parseRawTheoryModuleData(
    rawTheory00,
    NAVIGATION_METADATA_BY_MODULE_ID['module-0-repaso'],
  ),
  'module-1-ingenio': parseRawTheoryModuleData(
    rawTheory01,
    NAVIGATION_METADATA_BY_MODULE_ID['module-1-ingenio'],
  ),
  'module-3-bpo-sla': parseRawTheoryModuleData(
    rawTheory03,
    NAVIGATION_METADATA_BY_MODULE_ID['module-3-bpo-sla'],
  ),
  'module-4-optimizacion': parseRawTheoryModuleData(
    rawTheory04,
    NAVIGATION_METADATA_BY_MODULE_ID['module-4-optimizacion'],
  ),
  'module-5-gobernanza': parseRawTheoryModuleData(
    rawTheory05,
    NAVIGATION_METADATA_BY_MODULE_ID['module-5-gobernanza'],
  ),
  'module-6-auditoria': parseRawTheoryModuleData(
    rawTheory06,
    NAVIGATION_METADATA_BY_MODULE_ID['module-6-auditoria'],
  ),
};

const MODULE_OPENING_QUOTES: Record<string, ModuleOpeningQuoteSpec> = {
  'module-0-repaso': {
    quote:
      'La simplicidad es un requisito previo para la fiabilidad.',
    author: 'Edsger W. Dijkstra',
    source: 'How do we tell truths that might hurt? (1975)',
    pedagogicalContext:
      'Repasamos las bases de programación, POO, SOLID y estilos arquitectónicos antes de profundizar en el diseño de sistemas complejos.',
    conceptTitle: 'Apertura: Simplicidad y Estructura',
    conceptSubtitle: 'Edsger W. Dijkstra · Epígrafe',
  },
  'module-1-ingenio': {
    quote:
      'Cualquier tonto puede escribir código que una computadora entienda. Los buenos programadores escriben código que los humanos puedan entender.',
    author: 'Martin Fowler',
    source: 'Refactoring (1999)',
    pedagogicalContext:
      'El diseño de software busca expresar claramente el dominio, aislando el núcleo frente a los frameworks y detalles de infraestructura.',
    conceptTitle: 'Apertura: El Ingenio en el Diseño',
    conceptSubtitle: 'Martin Fowler · Epígrafe',
  },
  'module-3-bpo-sla': {
    quote:
      'No se puede gestionar lo que no se puede medir.',
    author: 'Peter Drucker',
    source: 'Principios de Gestión y Contratos de Servicio',
    pedagogicalContext:
      'Tercerizar procesos exige distinguir qué es diferenciador para el negocio y establecer acuerdos de nivel de servicio objetivamente medibles.',
    conceptTitle: 'Apertura: Medir y Acordar el Servicio',
    conceptSubtitle: 'Peter Drucker · Epígrafe',
  },
  'module-4-optimizacion': {
    quote:
      'La optimización prematura es la raíz de todos los males en programación.',
    author: 'Donald Knuth',
    source: 'Structured Programming with go to Statements (1974)',
    pedagogicalContext:
      'Primero medimos con evidencia empírica dónde está el cuello de botella en CPU o memoria; recién después aplicamos optimizaciones quirúrgicas.',
    conceptTitle: 'Apertura: Medir Antes de Optimizar',
    conceptSubtitle: 'Donald Knuth · Epígrafe',
  },
  'module-5-gobernanza': {
    quote:
      'Las organizaciones no fracasan por falta de tecnología, sino por la ausencia de gobierno sobre sus decisiones y riesgos.',
    author: 'Marco de Gobernanza IT',
    source: 'COBIT / Gestión de Riesgos Corporativos',
    pedagogicalContext:
      'Alineamos las decisiones técnicas, políticas de seguridad y mecanismos de respaldo frente a fallas externas con los objetivos de la organización.',
    conceptTitle: 'Apertura: Gobernanza y Gestión del Riesgo',
    conceptSubtitle: 'Gobernanza IT · Epígrafe',
  },
  'module-6-auditoria': {
    quote:
      'Cuando una medida se convierte en un objetivo, deja de ser una buena medida.',
    author: 'Charles Goodhart',
    source: 'Ley de Goodhart (1975)',
    pedagogicalContext:
      'Cerramos el curso uniendo métricas reales, trazabilidad criptográfica de auditoría y responsabilidad ética del ingeniero de software.',
    conceptTitle: 'Apertura: Integridad, Métricas y Ética',
    conceptSubtitle: 'Charles Goodhart · Epígrafe',
  },
  'module-practice': {
    quote:
      'La teoría sin práctica es estéril; la práctica sin teoría es ciega.',
    author: 'Immanuel Kant (adaptación académica)',
    source: 'Práctica de Ingeniería de Software · UADE',
    pedagogicalContext:
      'Alterná entre la pestaña de Ejercicios Prácticos y la pestaña de Tareas para poner a prueba cada unidad.',
    conceptTitle: 'Apertura: Taller Práctico y Tareas',
    conceptSubtitle: 'UADE · Práctica',
  },
};

const CONCEPT_VISUALIZER_MAP: Record<string, SlideVisualizerBinding> = {
  'sintesis-de-arquitecturas': {
    id: 'architecture-flow',
    title: 'Simulador de Flujo y Dependencias por Arquitectura',
  },
  'patron-command': {
    id: 'chess-command-di',
    title: 'Ajedrez: Patrón Command (Execute/Undo) y 4 Niveles de DI',
  },
  'matriz-decision-ponderada': {
    id: 'weighted-vendor-matrix',
    title: 'Matriz Ponderada de Proveedores y Clasificador Core vs. Commodity',
  },
  'profiling-memoria-y-arquitectura': {
    id: 'object-pool-memory',
    title: 'Simulador de Object Pool vs. GC en Heap y Memory Leak (Dispose)',
  },
  'bonus-ia-en-ajedrez-gobernanza': {
    id: 'risk-matrix-advisor',
    title: 'Matriz de Riesgos (ISO 31000) y Flujo AdvisedMoveSelector',
  },
  'bonus-java-hmac-auditlog': {
    id: 'hmac-audit-chain',
    title: 'Cadena de Auditoría AuditLog (HmacSHA256) y firstBrokenEntry()',
  },
};

export function buildCourseDeckSlides(): ConceptSlide[] {
  return buildSlideDeck({
    modules: MODULE_NAVIGATION_LIST,
    studyModulesById: STUDY_MODULES_BY_ID,
    moduleOpeningQuotesById: MODULE_OPENING_QUOTES,
    practiceModuleId: PRACTICE_MODULE_ID,
    exercises: EXAM_EXERCISES_LIST,
    conceptVisualizersById: CONCEPT_VISUALIZER_MAP,
  });
}

export const COURSE_SLIDE_DECK: ConceptSlide[] = buildCourseDeckSlides();

export const COURSE_SEARCH_INDEX: SearchableStudyEntry[] = buildStudySearchIndex({
  modules: MODULE_NAVIGATION_LIST,
  studyModulesById: STUDY_MODULES_BY_ID,
  exercises: [...EXAM_EXERCISES_LIST, ...COURSE_TASKS_LIST],
  practiceModuleId: PRACTICE_MODULE_ID,
});

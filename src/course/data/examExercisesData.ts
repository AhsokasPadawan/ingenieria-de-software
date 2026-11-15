import ejerciciosU00 from '../../../ejercicios/ejercicios_unidad_00.json';
import ejerciciosU01 from '../../../ejercicios/ejercicios_unidad_01.json';
import ejerciciosU03 from '../../../ejercicios/ejercicios_unidad_03.json';
import ejerciciosU04 from '../../../ejercicios/ejercicios_unidad_04.json';
import ejerciciosU05 from '../../../ejercicios/ejercicios_unidad_05.json';
import ejerciciosU06 from '../../../ejercicios/ejercicios_unidad_06.json';
import tareasU01 from '../../../ejercicios/tareas_unidad_01.json';
import tareasU03 from '../../../ejercicios/tareas_unidad_03.json';
import tareasU04 from '../../../ejercicios/tareas_unidad_04.json';
import tareasU05 from '../../../ejercicios/tareas_unidad_05.json';
import {
  ExamExerciseComplexityAnalysis,
  ExamExerciseConceptualStrategy,
  ExamExerciseItem,
} from '../../core/domain/coreTypes';
import {
  ExerciseParserConfig,
  parseRawExercisesData,
  RawExerciseItem,
  RawExercisesData,
} from '../../core/domain/jsonCourseProcessor';
import { PracticeFilterOption } from '../../core/ui/practice/PracticeFilterBar';

const UNIT_CATEGORY_LABELS: Record<string, string> = {
  unidad_00: 'Unidad 00',
  unidad_01: 'Unidad 01',
  unidad_03: 'Unidad 03',
  unidad_04: 'Unidad 04',
  unidad_05: 'Unidad 05',
  unidad_06: 'Unidad 06',
};

const STRATEGY_LOOKUP: Record<string, ExamExerciseConceptualStrategy> = {
  'Unidad 00': {
    invariantAndIntuition:
      'Separar responsabilidades en capas o puertos bien definidos, asegurando que las dependencias apunten hacia el dominio.',
    keySteps: [
      'Identificar los componentes de dominio, aplicación e infraestructura.',
      'Verificar la dirección de las dependencias y el acoplamiento.',
      'Justificar la elección arquitectónica según escalabilidad y mantenibilidad.',
    ],
    recurrenceOrTransitionLatex: '\\text{Dependencias} \\longrightarrow \\text{Núcleo de Dominio}',
  },
  'Unidad 01': {
    invariantAndIntuition:
      'Aplicar SOLID, inversión de dependencias y patrones de diseño sin caer en sobre-ingeniería innecesaria.',
    keySteps: [
      'Detectar qué responsabilidades cambian por motivos distintos.',
      'Introducir abstracciones solo donde exista variabilidad real.',
      'Proteger el núcleo del dominio frente a frameworks externos.',
    ],
    recurrenceOrTransitionLatex: '\\text{Ingenio} = \\text{Simplicidad} + \\text{Desacoplamiento}',
  },
  'Unidad 03': {
    invariantAndIntuition:
      'Evaluar qué procesos son Core del negocio frente a Commodities tercerizables mediante métricas objetivas de SLA.',
    keySteps: [
      'Clasificar el proceso en Core vs. Commodity.',
      'Definir SLIs, SLOs y cláusulas medibles en el SLA.',
      'Ponderar proveedores con una matriz multicriterio.',
    ],
    recurrenceOrTransitionLatex: '\\text{Score} = \\sum_{i} w_i \\cdot c_i',
  },
  'Unidad 04': {
    invariantAndIntuition:
      'Medir antes de optimizar (Regla de Knuth) atacando cuellos de botella reales de CPU, GC y memoria.',
    keySteps: [
      'Perfilar asignaciones en Heap, Stack y tiempo de CPU.',
      'Evaluar complejidad temporal y espacial de la ruta crítica.',
      'Aplicar Object Pool, caché o liberación determinística (Dispose) cuando corresponda.',
    ],
    recurrenceOrTransitionLatex: 'T(n) \\text{ y presión de GC en ruta crítica}',
  },
  'Unidad 05': {
    invariantAndIntuition:
      'Alinear decisiones técnicas con gobernanza de IT, matriz de riesgos (Probabilidad × Impacto) y mecanismos de respaldo.',
    keySteps: [
      'Identificar amenazas, impacto operativo y probabilidad de ocurrencia.',
      'Definir controles preventivos, detectivos o de fallback.',
      'Vincular políticas y normativas con verificaciones en el código.',
    ],
    recurrenceOrTransitionLatex: '\\text{Riesgo} = \\text{Probabilidad} \\times \\text{Impacto}',
  },
  'Unidad 06': {
    invariantAndIntuition:
      'Garantizar trazabilidad, métricas no manipulables (Ley de Goodhart) e integridad criptográfica de auditoría.',
    keySteps: [
      'Distinguir métricas informativas (KPI/KRI) de objetivos perversos.',
      'Verificar cadenas de auditoría mediante hashes encadenados o HMAC.',
      'Evaluar implicancias éticas y de cumplimiento normativo.',
    ],
    recurrenceOrTransitionLatex: 'h_i = \\text{HMAC}(K, \\text{datos}_i \\parallel h_{i-1})',
  },
};

function buildDefaultAnalysis(targetLatex: string): ExamExerciseComplexityAnalysis {
  return {
    temporalLatex: targetLatex,
    spatialLatex: '\\text{Criterio de Diseño}',
    justification:
      'Análisis fundamentado en los principios arquitectónicos, métricas y estándares vistos en la unidad.',
    theoremApplied: 'Ingeniería de Software — Ingenio y Diseño (UADE)',
  };
}

function resolveSoftwareSourceLabels(rawSource: string): {
  difficultyLabel: string;
  sourceOrigin: string;
} {
  const lower = rawSource.toLowerCase();
  const isTarea = lower.includes('tarea') || lower.includes('teams');
  return {
    difficultyLabel: isTarea ? 'Entrega Obligatoria' : 'Práctica de Unidad',
    sourceOrigin: rawSource || 'Cátedra UADE',
  };
}

export const COURSE_EXERCISE_PARSER_CONFIG: ExerciseParserConfig = {
  categoryLabels: UNIT_CATEGORY_LABELS,
  defaultCategory: 'Unidad 01',
  strategiesByCategory: STRATEGY_LOOKUP,
  resolveTargetComplexity: () => '\\text{Diseño y Análisis}',
  resolveComplexityAnalysis: buildDefaultAnalysis,
  resolveSourceLabels: resolveSoftwareSourceLabels,
};

const rawExercisesPayload: RawExercisesData = {
  metadata: {
    titulo: 'Ejercicios Prácticos — Ingeniería de Software (UADE)',
    descripcion: 'Banco de ejercicios prácticos por unidad.',
    temas: ['unidad_00', 'unidad_01', 'unidad_03', 'unidad_04', 'unidad_05', 'unidad_06'],
  },
  ejercicios_por_tema: {
    unidad_00: ejerciciosU00.ejercicios as RawExerciseItem[],
    unidad_01: ejerciciosU01.ejercicios as RawExerciseItem[],
    unidad_03: ejerciciosU03.ejercicios as RawExerciseItem[],
    unidad_04: ejerciciosU04.ejercicios as RawExerciseItem[],
    unidad_05: ejerciciosU05.ejercicios as RawExerciseItem[],
    unidad_06: ejerciciosU06.ejercicios as RawExerciseItem[],
  },
};

const rawTasksPayload: RawExercisesData = {
  metadata: {
    titulo: 'Tareas — Ingeniería de Software (UADE)',
    descripcion: 'Consignas y tareas individuales de las unidades.',
    temas: ['unidad_01', 'unidad_03', 'unidad_04', 'unidad_05'],
  },
  ejercicios_por_tema: {
    unidad_01: tareasU01.ejercicios as RawExerciseItem[],
    unidad_03: tareasU03.ejercicios as RawExerciseItem[],
    unidad_04: tareasU04.ejercicios as RawExerciseItem[],
    unidad_05: tareasU05.ejercicios as RawExerciseItem[],
  },
};

export const EXAM_EXERCISES_LIST: ExamExerciseItem[] = parseRawExercisesData(
  rawExercisesPayload,
  COURSE_EXERCISE_PARSER_CONFIG,
);

export const COURSE_TASKS_LIST: ExamExerciseItem[] = parseRawExercisesData(
  rawTasksPayload,
  COURSE_EXERCISE_PARSER_CONFIG,
).map((taskItem, index) => ({
  ...taskItem,
  id: `tarea-${index + 1}-${taskItem.id}`,
  number: index + 1,
}));

export const EXERCISE_UNIT_FILTERS: readonly PracticeFilterOption[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Unidad 00', value: 'Unidad 00' },
  { label: 'Unidad 01', value: 'Unidad 01' },
  { label: 'Unidad 03', value: 'Unidad 03' },
  { label: 'Unidad 04', value: 'Unidad 04' },
  { label: 'Unidad 05', value: 'Unidad 05' },
  { label: 'Unidad 06', value: 'Unidad 06' },
];

export const TASK_UNIT_FILTERS: readonly PracticeFilterOption[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Unidad 01', value: 'Unidad 01' },
  { label: 'Unidad 03', value: 'Unidad 03' },
  { label: 'Unidad 04', value: 'Unidad 04' },
  { label: 'Unidad 05', value: 'Unidad 05' },
];

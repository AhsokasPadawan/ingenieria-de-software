import {
  ExamParadigmCategory,
  ModuleId,
  ModuleSubtopicItem,
} from '../../core/domain/coreTypes';
import { resolveActiveSubtopicByConfig } from '../../core/domain/slideDeckBuilder';
import { PRACTICE_MODULE_ID } from './courseModulesData';

export type { ModuleSubtopicItem };

export const MODULE_SUBTOPICS_LOOKUP: Record<ModuleId, ModuleSubtopicItem[]> = {
  'module-0-repaso': [
    {
      id: 'm0-sub-apertura',
      title: 'Apertura: Dijkstra',
      slideId: 'module-0-repaso-apertura-quote',
    },
    {
      id: 'm0-sub-fundamentos',
      title: 'Fundamentos de Programación',
      slideId: 'objetivo-de-la-clase-theory',
    },
    {
      id: 'm0-sub-poo',
      title: 'Programación Orientada a Objetos',
      slideId: 'programacion-orientada-a-objetos-theory',
    },
    {
      id: 'm0-sub-solid',
      title: 'Buenas Prácticas, SOLID y Patrones',
      slideId: 'buenas-practicas-de-desarrollo-theory',
    },
    {
      id: 'm0-sub-arquitectura',
      title: 'Arquitectura y Escalabilidad',
      slideId: 'arquitectura-de-software-theory',
    },
    {
      id: 'm0-sub-diagramas',
      title: 'Capas, Hexagonal y ECS',
      slideId: 'arquitecturas-en-diagramas-theory',
    },
  ],
  'module-1-ingenio': [
    {
      id: 'm1-sub-apertura',
      title: 'Apertura: Martin Fowler',
      slideId: 'module-1-ingenio-apertura-quote',
    },
    {
      id: 'm1-sub-requisitos',
      title: 'Requisitos y Principio Rector',
      slideId: 'objetivo-clase-1-theory',
    },
    {
      id: 'm1-sub-hexagonal',
      title: 'Frontera Dominio / Framework',
      slideId: 'nucleo-y-adaptadores-theory',
    },
    {
      id: 'm1-sub-solid',
      title: 'SOLID, DI y Composición',
      slideId: 'solid-panorama-general-theory',
    },
    {
      id: 'm1-sub-patrones',
      title: 'Patrones State y Command',
      slideId: 'cinco-patrones-clasicos-theory',
    },
    {
      id: 'm1-sub-testing',
      title: 'Testing, Ágiles y TPO',
      slideId: 'tipos-de-pruebas-theory',
    },
  ],
  'module-3-bpo-sla': [
    {
      id: 'm3-sub-apertura',
      title: 'Apertura: Peter Drucker',
      slideId: 'module-3-bpo-sla-apertura-quote',
    },
    {
      id: 'm3-sub-bpo',
      title: 'Tercerización (BPO) y Decisión',
      slideId: 'objetivo-unidad-03-theory',
    },
    {
      id: 'm3-sub-sla',
      title: 'SLA como Contrato e Interfaz',
      slideId: 'que-es-un-sla-theory',
    },
    {
      id: 'm3-sub-proveedores',
      title: 'Evaluación de Proveedores',
      slideId: 'evaluacion-de-proveedores-rfi-rfp-theory',
    },
  ],
  'module-4-optimizacion': [
    {
      id: 'm4-sub-apertura',
      title: 'Apertura: Donald Knuth',
      slideId: 'module-4-optimizacion-apertura-quote',
    },
    {
      id: 'm4-sub-cpu',
      title: 'CPU: Big O y Profilers',
      slideId: 'objetivo-clase-6-cpu-theory',
    },
    {
      id: 'm4-sub-tecnicas',
      title: '8 Técnicas de Optimización CPU',
      slideId: 'tecnica-cpu-precomputation-theory',
    },
    {
      id: 'm4-sub-memoria',
      title: 'Memoria RAM, GC y Object Pool',
      slideId: 'tipos-de-memoria-theory',
    },
  ],
  'module-5-gobernanza': [
    {
      id: 'm5-sub-apertura',
      title: 'Apertura: Gobernanza IT',
      slideId: 'module-5-gobernanza-apertura-quote',
    },
    {
      id: 'm5-sub-marcos',
      title: 'Gobernanza IT y Marcos (COBIT/ISO)',
      slideId: 'que-es-gobernanza-it-theory',
    },
    {
      id: 'm5-sub-riesgos',
      title: 'Políticas, Normativas y Riesgos',
      slideId: 'politicas-estandares-procedimientos-guias-theory',
    },
    {
      id: 'm5-sub-bonus',
      title: 'Bonus: IA como Adaptador y Fallback',
      slideId: 'bonus-ia-en-ajedrez-gobernanza-theory',
    },
  ],
  'module-6-auditoria': [
    {
      id: 'm6-sub-apertura',
      title: 'Apertura: Ley de Goodhart',
      slideId: 'module-6-auditoria-apertura-quote',
    },
    {
      id: 'm6-sub-auditoria',
      title: 'Auditoría, KPIs y KRIs',
      slideId: 'objetivo-unidad-06-theory',
    },
    {
      id: 'm6-sub-etica',
      title: 'Ética Profesional e Integridad',
      slideId: 'etica-profesional-y-codigo-acm-ieee-theory',
    },
  ],
  [PRACTICE_MODULE_ID]: [
    {
      id: 'mp-sub-ejercicios',
      title: 'Ejercicios Prácticos',
      paradigm: 'exercises',
    },
    {
      id: 'mp-sub-tareas',
      title: 'Tareas Obligatorias',
      paradigm: 'tasks',
    },
  ],
};

export function resolveActiveSubtopicId(
  moduleId: ModuleId,
  moduleSlideIds: string[],
  activeSlideId?: string,
  activeExerciseParadigm?: ExamParadigmCategory,
): string | undefined {
  return resolveActiveSubtopicByConfig({
    subtopics: MODULE_SUBTOPICS_LOOKUP[moduleId] ?? [],
    moduleSlideIds,
    activeSlideId,
    activeExerciseCategory: activeExerciseParadigm,
    isPracticeModule: moduleId === PRACTICE_MODULE_ID,
  });
}

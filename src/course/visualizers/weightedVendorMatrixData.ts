export type VendorMatrixTabKind = 'matrix' | 'classifier';

export type CriterionKey = 'cost' | 'quality' | 'support';

export interface CriterionSpec {
  key: CriterionKey;
  label: string;
  helperText: string;
}

export interface VendorProfile {
  id: string;
  name: string;
  tag: string;
  scores: Record<CriterionKey, number>;
}

export interface MatrixPresetSpec {
  id: string;
  label: string;
  weights: Record<CriterionKey, number>;
}

export const MATRIX_CRITERIA: readonly CriterionSpec[] = [
  {
    key: 'cost',
    label: 'Costo (TCO)',
    helperText: 'Menor costo total obtiene mayor puntaje (1–10)',
  },
  {
    key: 'quality',
    label: 'Calidad Técnica',
    helperText: 'Arquitectura, pruebas, referencias y madurez (1–10)',
  },
  {
    key: 'support',
    label: 'Soporte y SLA',
    helperText: 'Disponibilidad garantizada, MTTR y penalidades (1–10)',
  },
];

export const INITIAL_VENDORS: readonly VendorProfile[] = [
  {
    id: 'vendor-a',
    name: 'Proveedor A',
    tag: 'Low Cost',
    scores: { cost: 8, quality: 6, support: 7 },
  },
  {
    id: 'vendor-b',
    name: 'Proveedor B',
    tag: 'Especialista',
    scores: { cost: 6, quality: 9, support: 8 },
  },
  {
    id: 'vendor-c',
    name: 'Proveedor C',
    tag: 'Enterprise',
    scores: { cost: 4, quality: 8, support: 9 },
  },
];

export const MATRIX_PRESETS: readonly MatrixPresetSpec[] = [
  {
    id: 'balanced',
    label: 'Equilibrado (30/40/30)',
    weights: { cost: 30, quality: 40, support: 30 },
  },
  {
    id: 'cost-first',
    label: 'Priorizar Costo',
    weights: { cost: 60, quality: 25, support: 15 },
  },
  {
    id: 'mission-critical',
    label: 'Core Crítico / Alta Calidad',
    weights: { cost: 15, quality: 45, support: 40 },
  },
];

export interface BpoFactorAnswer {
  differentiation: number;
  changeFrequency: number;
  modularity: number;
  proprietaryRisk: number;
}

export interface BpoExamplePreset {
  id: string;
  label: string;
  answers: BpoFactorAnswer;
}

export const BPO_EXAMPLE_PRESETS: readonly BpoExamplePreset[] = [
  {
    id: 'pricing-engine',
    label: 'Motor de Pricing',
    answers: {
      differentiation: 5,
      changeFrequency: 5,
      modularity: 2,
      proprietaryRisk: 5,
    },
  },
  {
    id: 'payroll',
    label: 'Liquidación de Sueldos',
    answers: {
      differentiation: 1,
      changeFrequency: 2,
      modularity: 5,
      proprietaryRisk: 2,
    },
  },
  {
    id: 'helpdesk',
    label: 'Mesa de Ayuda N1',
    answers: {
      differentiation: 2,
      changeFrequency: 3,
      modularity: 4,
      proprietaryRisk: 2,
    },
  },
];

export interface BpoFactorDescriptor {
  key: keyof BpoFactorAnswer;
  label: string;
  lowLabel: string;
  highLabel: string;
}

export const BPO_FACTORS: readonly BpoFactorDescriptor[] = [
  {
    key: 'differentiation',
    label: 'Diferenciación Competitiva',
    lowLabel: 'Genérico (1)',
    highLabel: 'Diferenciador clave (5)',
  },
  {
    key: 'changeFrequency',
    label: 'Frecuencia de Cambio',
    lowLabel: 'Estable (1)',
    highLabel: 'Cambia cada sprint (5)',
  },
  {
    key: 'modularity',
    label: 'Prueba de Modularidad (Interfaz Clara)',
    lowLabel: 'Muy acoplado (1)',
    highLabel: 'Contrato / API limpia (5)',
  },
  {
    key: 'proprietaryRisk',
    label: 'Riesgo de Pérdida de Know-How',
    lowLabel: 'Bajo riesgo (1)',
    highLabel: 'Conocimiento crítico (5)',
  },
];

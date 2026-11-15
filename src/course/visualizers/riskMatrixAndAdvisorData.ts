export type GovernanceTabKind = 'risk-matrix' | 'advisor-flow';

export type RiskTreatmentKind = 'mitigate' | 'transfer' | 'accept' | 'avoid';

export type RiskLevelKind = 'low' | 'medium' | 'high' | 'critical';

export type AdvisorScenarioId = 'valid' | 'illegal' | 'timeout' | 'network-error';

export interface RiskItem {
  id: string;
  title: string;
  asset: string;
  threat: string;
  vulnerability: string;
  inherentProbability: number;
  inherentImpact: number;
  treatment: RiskTreatmentKind;
  controlDescription: string;
}

export interface AdvisorFlowStep {
  title: string;
  actor: 'Núcleo' | 'LlmChessAdvisor' | 'RandomChessAdvisor' | 'IAdvisorLog';
  detail: string;
  outcomeTag: string;
  isFallbackPath: boolean;
}

export interface AdvisorScenarioSpec {
  id: AdvisorScenarioId;
  label: string;
  fen: string;
  suggestedMove: string | null;
  finalMove: string;
  outcomeCode: string;
  steps: readonly AdvisorFlowStep[];
}

export const GOVERNANCE_TAB_CONFIG: Record<
  GovernanceTabKind,
  { label: string; title: string; footer: string }
> = {
  'risk-matrix': {
    label: 'Matriz de Riesgos (ISO 31000)',
    title: 'Matriz de Riesgos (Probabilidad × Impacto) y Tratamiento',
    footer:
      'Riesgo cero no existe: los controles reducen probabilidad o impacto, dejando un riesgo residual que debe ser aceptado explícitamente según el apetito de riesgo.',
  },
  'advisor-flow': {
    label: 'Flujo AdvisedMoveSelector',
    title: 'Gobernanza en Código: Validación y Respaldo de IA (IChessAdvisor)',
    footer:
      'La IA asesora, no arbitra: el núcleo valida la salida contra legalMoves, aplica timeout/fallback ante fallas y registra cada decisión en IAdvisorLog.',
  },
};

export const TREATMENT_CONFIG: Record<
  RiskTreatmentKind,
  {
    label: string;
    description: string;
    probabilityDelta: number;
    impactDelta: number;
  }
> = {
  mitigate: {
    label: 'Mitigar',
    description: 'Aplicar controles técnicos para reducir probabilidad o impacto.',
    probabilityDelta: -2,
    impactDelta: -1,
  },
  transfer: {
    label: 'Transferir',
    description: 'Compartir impacto con un tercero (seguro / SLA); la responsabilidad sigue siendo propia.',
    probabilityDelta: 0,
    impactDelta: -2,
  },
  accept: {
    label: 'Aceptar',
    description: 'Asumir el riesgo de forma consciente y documentada dentro del apetito de riesgo.',
    probabilityDelta: 0,
    impactDelta: 0,
  },
  avoid: {
    label: 'Evitar',
    description: 'Eliminar la actividad o exposición que origina el riesgo.',
    probabilityDelta: -4,
    impactDelta: -4,
  },
};

export const RISK_LEVEL_CONFIG: Record<
  RiskLevelKind,
  { label: string; badgeClass: string; cellClass: string }
> = {
  low: {
    label: 'Bajo',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    cellClass: 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300',
  },
  medium: {
    label: 'Medio',
    badgeClass: 'border-amber-500/40 bg-amber-500/15 text-amber-200',
    cellClass: 'bg-amber-950/50 border-amber-800/50 text-amber-300',
  },
  high: {
    label: 'Alto',
    badgeClass: 'border-orange-500/50 bg-orange-500/20 text-orange-200',
    cellClass: 'bg-orange-950/60 border-orange-800/60 text-orange-300',
  },
  critical: {
    label: 'Crítico',
    badgeClass: 'border-rose-500/60 bg-rose-500/25 text-rose-200',
    cellClass: 'bg-rose-950/70 border-rose-800/60 text-rose-300',
  },
};

export function classifyRiskScore(score: number): RiskLevelKind {
  if (score >= 15) return 'critical';
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

export function computeResidualCoordinates(risk: RiskItem): {
  probability: number;
  impact: number;
  score: number;
  level: RiskLevelKind;
} {
  const delta = TREATMENT_CONFIG[risk.treatment];
  const probability = Math.max(1, Math.min(5, risk.inherentProbability + delta.probabilityDelta));
  const impact = Math.max(1, Math.min(5, risk.inherentImpact + delta.impactDelta));
  const score = probability * impact;
  return {
    probability,
    impact,
    score,
    level: classifyRiskScore(score),
  };
}

export const INITIAL_RISKS: readonly RiskItem[] = [
  {
    id: 'api-key-leak',
    title: 'Exposición de API Key en repositorio',
    asset: 'Credenciales de proveedor LLM y presupuesto',
    threat: 'Atacante externo que escanea commits públicos',
    vulnerability: 'Secretos hardcodeados sin escaneo en CI',
    inherentProbability: 4,
    inherentImpact: 5,
    treatment: 'mitigate',
    controlDescription: 'Variables de entorno + escaneo automático de secretos + rotación.',
  },
  {
    id: 'llm-outage',
    title: 'Caída o latencia extrema de API externa',
    asset: 'Disponibilidad de la partida de ajedrez',
    threat: 'Falla del proveedor de IA o saturación de red',
    vulnerability: 'Llamada HTTP sin timeout ni adaptador de respaldo',
    inherentProbability: 4,
    inherentImpact: 4,
    treatment: 'mitigate',
    controlDescription: 'CancellationToken con timeout + fallback a RandomChessAdvisor.',
  },
  {
    id: 'shadow-it',
    title: 'Shadow IT: carga de datos en herramientas no aprobadas',
    asset: 'Datos personales de usuarios (Ley 25.326)',
    threat: 'Filtración o incumplimiento regulatorio ante AAIP',
    vulnerability: 'Falta de política de uso aceptable y minimización',
    inherentProbability: 3,
    inherentImpact: 4,
    treatment: 'avoid',
    controlDescription: 'Enviar solo posición FEN y jugadas legales; cero datos personales.',
  },
  {
    id: 'minor-ui-glitch',
    title: 'Desalineación menor de tooltip en navegador antiguo',
    asset: 'Experiencia visual secundaria',
    threat: 'Incompatibilidad CSS puntual',
    vulnerability: 'Navegador sin soporte de subgrid',
    inherentProbability: 2,
    inherentImpact: 1,
    treatment: 'accept',
    controlDescription: 'Documentado en registro de riesgos; sin impacto operativo.',
  },
];

export const LEGAL_MOVES_SAMPLE = ['e2e4', 'd2d4', 'g1f3', 'c2c4'] as const;

export const ADVISOR_SCENARIOS: Record<AdvisorScenarioId, AdvisorScenarioSpec> = {
  valid: {
    id: 'valid',
    label: '1. Jugada válida',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    suggestedMove: 'e2e4',
    finalMove: 'e2e4',
    outcomeCode: 'aceptada',
    steps: [
      {
        title: '1. Solicitud con Timeout (Minimización de datos)',
        actor: 'Núcleo',
        detail: 'Llama a primary.SuggestMoveAsync(fen, legalMoves, cts.Token) sin enviar datos personales.',
        outcomeTag: 'Esperando LLM',
        isFallbackPath: false,
      },
      {
        title: '2. Respuesta del Adaptador LLM',
        actor: 'LlmChessAdvisor',
        detail: 'Devuelve la jugada sugerida "e2e4" dentro del límite de timeout y MaxTokens.',
        outcomeTag: 'Sugerencia: e2e4',
        isFallbackPath: false,
      },
      {
        title: '3. Validación en el Núcleo',
        actor: 'Núcleo',
        detail: 'Verifica legalMoves.Contains("e2e4") === true. La IA asesora, el núcleo arbitra.',
        outcomeTag: 'Válida',
        isFallbackPath: false,
      },
      {
        title: '4. Registro de Auditoría (IAdvisorLog)',
        actor: 'IAdvisorLog',
        detail: 'Registra AdvisorDecision(fen, "LlmChessAdvisor", "e2e4", "e2e4", "aceptada").',
        outcomeTag: 'aceptada',
        isFallbackPath: false,
      },
    ],
  },
  illegal: {
    id: 'illegal',
    label: '2. Jugada ilegal (Alucinación)',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    suggestedMove: 'e2e5',
    finalMove: 'g1f3',
    outcomeCode: 'respaldo:jugada-ilegal',
    steps: [
      {
        title: '1. Solicitud con Timeout',
        actor: 'Núcleo',
        detail: 'Llama a primary.SuggestMoveAsync(fen, legalMoves, cts.Token).',
        outcomeTag: 'Esperando LLM',
        isFallbackPath: false,
      },
      {
        title: '2. Alucinación del Modelo',
        actor: 'LlmChessAdvisor',
        detail: 'El modelo devuelve "e2e5", que no pertenece a legalMoves.',
        outcomeTag: 'Sugerencia: e2e5',
        isFallbackPath: true,
      },
      {
        title: '3. Rechazo y Respaldo Local',
        actor: 'RandomChessAdvisor',
        detail: 'legalMoves.Contains("e2e5") es false -> outcome = "jugada-ilegal". Se invoca fallback -> "g1f3".',
        outcomeTag: 'Fallback: g1f3',
        isFallbackPath: true,
      },
      {
        title: '4. Registro de Auditoría (IAdvisorLog)',
        actor: 'IAdvisorLog',
        detail: 'Registra AdvisorDecision(fen, "LlmChessAdvisor", "e2e5", "g1f3", "respaldo:jugada-ilegal").',
        outcomeTag: 'respaldo:jugada-ilegal',
        isFallbackPath: true,
      },
    ],
  },
  timeout: {
    id: 'timeout',
    label: '3. Timeout vencido',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    suggestedMove: null,
    finalMove: 'd2d4',
    outcomeCode: 'respaldo:timeout',
    steps: [
      {
        title: '1. Solicitud con CancellationTokenSource',
        actor: 'Núcleo',
        detail: 'cts.CancelAfter(timeout) protege la disponibilidad del sistema.',
        outcomeTag: 'Timer activo',
        isFallbackPath: false,
      },
      {
        title: '2. Vencimiento del Timeout',
        actor: 'LlmChessAdvisor',
        detail: 'La API tarda más que el límite; se captura OperationCanceledException.',
        outcomeTag: 'outcome = "timeout"',
        isFallbackPath: true,
      },
      {
        title: '3. Respaldo Local Inmediato',
        actor: 'RandomChessAdvisor',
        detail: 'El núcleo ejecuta fallback.SuggestMoveAsync(fen, legalMoves, ct) -> "d2d4".',
        outcomeTag: 'Fallback: d2d4',
        isFallbackPath: true,
      },
      {
        title: '4. Registro de Auditoría (IAdvisorLog)',
        actor: 'IAdvisorLog',
        detail: 'Registra AdvisorDecision(fen, "LlmChessAdvisor", null, "d2d4", "respaldo:timeout").',
        outcomeTag: 'respaldo:timeout',
        isFallbackPath: true,
      },
    ],
  },
  'network-error': {
    id: 'network-error',
    label: '4. Error de red (HTTP)',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    suggestedMove: null,
    finalMove: 'c2c4',
    outcomeCode: 'respaldo:error-de-red',
    steps: [
      {
        title: '1. Solicitud al Adaptador HTTP',
        actor: 'Núcleo',
        detail: 'Llama a primary.SuggestMoveAsync(fen, legalMoves, cts.Token).',
        outcomeTag: 'Conectando',
        isFallbackPath: false,
      },
      {
        title: '2. Falla de Red en Proveedor',
        actor: 'LlmChessAdvisor',
        detail: 'Se captura HttpRequestException (servicio caído o sin conectividad).',
        outcomeTag: 'outcome = "error-de-red"',
        isFallbackPath: true,
      },
      {
        title: '3. Degradación Elegante',
        actor: 'RandomChessAdvisor',
        detail: 'El juego continúa sin interrumpirse usando fallback -> "c2c4".',
        outcomeTag: 'Fallback: c2c4',
        isFallbackPath: true,
      },
      {
        title: '4. Registro de Auditoría (IAdvisorLog)',
        actor: 'IAdvisorLog',
        detail: 'Registra AdvisorDecision(fen, "LlmChessAdvisor", null, "c2c4", "respaldo:error-de-red").',
        outcomeTag: 'respaldo:error-de-red',
        isFallbackPath: true,
      },
    ],
  },
};

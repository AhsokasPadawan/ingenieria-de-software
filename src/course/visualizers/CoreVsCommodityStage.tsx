import { CheckCircle2, Sparkles } from 'lucide-react';
import {
  BPO_EXAMPLE_PRESETS,
  BPO_FACTORS,
  BpoFactorAnswer,
} from './weightedVendorMatrixData';

type ClassificationVerdictKey = 'core' | 'hybrid' | 'commodity';

interface ClassificationVerdictSpec {
  badge: string;
  headline: string;
  recommendation: string;
  cardClass: string;
  badgeClass: string;
}

const VERDICT_SPECS: Record<ClassificationVerdictKey, ClassificationVerdictSpec> = {
  core: {
    badge: 'CORE DEL NEGOCIO',
    headline: 'Mantener desarrollo In-House',
    recommendation:
      'Alta diferenciación, evolución frecuente o acoplamiento fuerte. Tercerizarlo pondría en riesgo la ventaja competitiva y generaría dependencia crítica.',
    cardClass: 'border-rose-700/70 bg-rose-950/35',
    badgeClass: 'bg-rose-950 text-rose-200 border border-rose-700',
  },
  hybrid: {
    badge: 'ZONA GRIS / HÍBRIDO',
    headline: 'Evaluar BPO selectivo con SLA estricto',
    recommendation:
      'Combinación mixta: si se terceriza parte de la ejecución, exigir interfaz desacoplada, métricas SLI/SLO verificables y cláusula clara de transferencia.',
    cardClass: 'border-amber-700/70 bg-amber-950/30',
    badgeClass: 'bg-amber-950 text-amber-200 border border-amber-700',
  },
  commodity: {
    badge: 'COMMODITY',
    headline: 'Candidato ideal para Tercerización (BPO)',
    recommendation:
      'Baja diferenciación y buena modularidad. Conviene delegar en un proveedor especializado bajo un SLA medible para liberar foco del equipo interno.',
    cardClass: 'border-emerald-700/70 bg-emerald-950/35',
    badgeClass: 'bg-emerald-950 text-emerald-200 border border-emerald-700',
  },
};

function classifyBpoProcess(answers: BpoFactorAnswer): ClassificationVerdictKey {
  const corePressure =
    answers.differentiation * 1.4 +
    answers.changeFrequency * 1.1 +
    answers.proprietaryRisk * 1.3 -
    answers.modularity * 1.1;

  if (corePressure >= 11.5 || (answers.modularity <= 2 && answers.differentiation >= 4)) {
    return 'core';
  }
  if (corePressure <= 6.5 && answers.modularity >= 3) {
    return 'commodity';
  }
  return 'hybrid';
}

export interface CoreVsCommodityStageProps {
  answers: BpoFactorAnswer;
  onChangeAnswer: (key: keyof BpoFactorAnswer, value: number) => void;
  onApplyExample: (example: BpoFactorAnswer) => void;
}

export function CoreVsCommodityStage({
  answers,
  onChangeAnswer,
  onApplyExample,
}: CoreVsCommodityStageProps) {
  const verdictKey = classifyBpoProcess(answers);
  const verdict = VERDICT_SPECS[verdictKey];

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
          Casos de ejemplo:
        </span>
        {BPO_EXAMPLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApplyExample(preset.answers)}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-200 transition hover:border-emerald-600 hover:bg-zinc-800"
          >
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {BPO_FACTORS.map((factor) => (
          <div
            key={factor.key}
            className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5 flex flex-col gap-1"
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-200">{factor.label}</span>
              <span className="font-mono text-emerald-300">{answers[factor.key]}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={answers[factor.key]}
              aria-label={factor.label}
              onChange={(event) =>
                onChangeAnswer(factor.key, Number(event.target.value))
              }
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>{factor.lowLabel}</span>
              <span>{factor.highLabel}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-xl border p-2.5 transition ${verdict.cardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-zinc-200 shrink-0" />
            <span className="text-sm font-bold text-zinc-100">{verdict.headline}</span>
          </div>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${verdict.badgeClass}`}
          >
            {verdict.badge}
          </span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">{verdict.recommendation}</p>
      </div>
    </div>
  );
}

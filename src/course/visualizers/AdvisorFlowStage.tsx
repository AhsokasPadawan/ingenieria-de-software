import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import {
  ADVISOR_SCENARIOS,
  AdvisorScenarioId,
  LEGAL_MOVES_SAMPLE,
} from './riskMatrixAndAdvisorData';
import { useVisualizerPlayback } from './shared/useVisualizerPlayback';

export function AdvisorFlowStage() {
  const [scenarioId, setScenarioId] = useState<AdvisorScenarioId>('valid');
  const scenario = ADVISOR_SCENARIOS[scenarioId];
  const playback = useVisualizerPlayback(scenario.steps);

  const handleSelectScenario = (nextId: AdvisorScenarioId) => {
    setScenarioId(nextId);
    playback.setCurrentStep(0);
  };

  const activeStep = playback.currentFrame;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['valid', 'illegal', 'timeout', 'network-error'] as const).map((key) => {
            const isSelected = scenarioId === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectScenario(key)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                  isSelected
                    ? 'border-violet-400 bg-violet-500/25 text-violet-100'
                    : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {ADVISOR_SCENARIOS[key].label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={playback.currentStep === 0}
            onClick={() => playback.setCurrentStep(Math.max(0, playback.currentStep - 1))}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs font-bold text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Anterior</span>
          </button>
          <span className="font-mono text-xs font-bold text-zinc-400">
            Paso {playback.currentStep + 1} / {playback.totalSteps}
          </span>
          <button
            type="button"
            disabled={playback.currentStep >= playback.totalSteps - 1}
            onClick={() =>
              playback.setCurrentStep(
                Math.min(playback.totalSteps - 1, playback.currentStep + 1),
              )
            }
            className="flex items-center gap-1 rounded-lg border border-violet-500/50 bg-violet-500/20 px-2 py-1 text-xs font-bold text-violet-100 hover:bg-violet-500/30 disabled:opacity-40"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={playback.resetPlayback}
            className="rounded-lg border border-zinc-700 bg-zinc-950 p-1.5 text-zinc-300 hover:bg-zinc-800"
            aria-label="Reiniciar pasos"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {scenario.steps.map((step, index) => {
          const isActive = index === playback.currentStep;
          const isCompleted = index < playback.currentStep;
          return (
            <button
              key={step.title}
              type="button"
              onClick={() => playback.setCurrentStep(index)}
              className={`flex flex-col justify-between gap-2 rounded-xl border p-2.5 text-left transition ${
                isActive
                  ? step.isFallbackPath
                    ? 'border-amber-400 bg-amber-950/40 ring-1 ring-amber-400/50'
                    : 'border-violet-400 bg-violet-950/40 ring-1 ring-violet-400/50'
                  : isCompleted
                    ? 'border-emerald-700/60 bg-emerald-950/20 opacity-90'
                    : 'border-zinc-800 bg-zinc-900/50 opacity-60 hover:opacity-90'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-200">
                  {step.actor}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                    step.isFallbackPath
                      ? 'bg-amber-500/20 text-amber-200'
                      : 'bg-emerald-500/20 text-emerald-200'
                  }`}
                >
                  {step.outcomeTag}
                </span>
              </div>
              <div className="text-xs font-bold text-zinc-100">{step.title}</div>
              <p className="text-[11px] leading-snug text-zinc-300">{step.detail}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 md:grid-cols-2">
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-bold uppercase tracking-wide text-zinc-400">
            Contexto enviado al adaptador (Minimización)
          </span>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 font-mono text-[11px] text-zinc-300">
            <div>fen: &quot;{scenario.fen}&quot;</div>
            <div>legalMoves: [{LEGAL_MOVES_SAMPLE.join(', ')}]</div>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs">
          <span className="font-bold uppercase tracking-wide text-zinc-400">
            Paso activo: {activeStep.actor}
          </span>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 font-mono text-[11px] text-violet-200">
            <div>suggested: {scenario.suggestedMove ?? 'null'}</div>
            <div>final: {scenario.finalMove}</div>
            <div>outcome: &quot;{scenario.outcomeCode}&quot;</div>
          </div>
        </div>
      </div>
    </div>
  );
}

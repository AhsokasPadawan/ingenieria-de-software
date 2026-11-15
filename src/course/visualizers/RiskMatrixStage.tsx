import { useState } from 'react';
import {
  classifyRiskScore,
  computeResidualCoordinates,
  INITIAL_RISKS,
  RISK_LEVEL_CONFIG,
  RiskItem,
  RiskTreatmentKind,
  TREATMENT_CONFIG,
} from './riskMatrixAndAdvisorData';

const GRID_LEVELS = [5, 4, 3, 2, 1] as const;
const IMPACT_LEVELS = [1, 2, 3, 4, 5] as const;

export function RiskMatrixStage() {
  const [risks, setRisks] = useState<readonly RiskItem[]>(INITIAL_RISKS);
  const [selectedRiskId, setSelectedRiskId] = useState<string>(INITIAL_RISKS[0].id);

  const selectedRisk = risks.find((item) => item.id === selectedRiskId) ?? risks[0];
  const inherentScore = selectedRisk.inherentProbability * selectedRisk.inherentImpact;
  const inherentLevel = classifyRiskScore(inherentScore);
  const residual = computeResidualCoordinates(selectedRisk);

  const updateSelectedRisk = (patch: Partial<RiskItem>) => {
    setRisks((previous) =>
      previous.map((item) =>
        item.id === selectedRisk.id ? { ...item, ...patch } : item,
      ),
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 lg:col-span-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-300">
            Matriz 5×5 (Probabilidad × Impacto)
          </span>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="rounded border border-rose-400/60 bg-rose-500/20 px-1.5 py-0.5 text-rose-200">
              I = Inherente
            </span>
            <span className="rounded border border-emerald-400/60 bg-emerald-500/20 px-1.5 py-0.5 text-emerald-200">
              R = Residual
            </span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1 text-center text-[10px]">
          <div className="flex items-center justify-center font-bold text-zinc-500">P \ I</div>
          {IMPACT_LEVELS.map((impact) => (
            <div key={impact} className="py-1 font-mono font-bold text-zinc-400">
              Imp {impact}
            </div>
          ))}

          {GRID_LEVELS.map((probability) => (
            <div key={probability} className="contents">
              <div className="flex items-center justify-center font-mono font-bold text-zinc-400">
                Prob {probability}
              </div>
              {IMPACT_LEVELS.map((impact) => {
                const score = probability * impact;
                const level = classifyRiskScore(score);
                const isInherentCell =
                  selectedRisk.inherentProbability === probability &&
                  selectedRisk.inherentImpact === impact;
                const isResidualCell =
                  residual.probability === probability && residual.impact === impact;

                return (
                  <button
                    key={`${probability}-${impact}`}
                    type="button"
                    onClick={() =>
                      updateSelectedRisk({
                        inherentProbability: probability,
                        inherentImpact: impact,
                      })
                    }
                    className={`relative flex min-h-[42px] flex-col items-center justify-center rounded-md border text-[11px] font-mono font-bold transition ${
                      RISK_LEVEL_CONFIG[level].cellClass
                    } ${
                      isInherentCell || isResidualCell
                        ? 'ring-2 ring-white/80'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span>{score}</span>
                    <div className="flex gap-0.5 text-[9px]">
                      {isInherentCell && (
                        <span className="rounded bg-rose-600 px-1 text-white">I</span>
                      )}
                      {isResidualCell && (
                        <span className="rounded bg-emerald-600 px-1 text-white">R</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <p className="text-[11px] text-zinc-400">
          Hacé clic en cualquier celda para mover la Probabilidad e Impacto inherentes del riesgo seleccionado.
        </p>
      </div>

      <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 lg:col-span-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {risks.map((risk) => {
              const isSelected = risk.id === selectedRisk.id;
              return (
                <button
                  key={risk.id}
                  type="button"
                  onClick={() => setSelectedRiskId(risk.id)}
                  className={`rounded-lg border px-2 py-1 text-[11px] font-bold transition ${
                    isSelected
                      ? 'border-violet-400 bg-violet-500/20 text-violet-100'
                      : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {risk.title}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/70 p-2.5 text-xs">
            <div>
              <span className="font-bold text-zinc-400">Activo: </span>
              <span className="text-zinc-200">{selectedRisk.asset}</span>
            </div>
            <div>
              <span className="font-bold text-zinc-400">Amenaza: </span>
              <span className="text-zinc-200">{selectedRisk.threat}</span>
            </div>
            <div>
              <span className="font-bold text-zinc-400">Vulnerabilidad: </span>
              <span className="text-zinc-200">{selectedRisk.vulnerability}</span>
            </div>
            <div>
              <span className="font-bold text-zinc-400">Control: </span>
              <span className="text-violet-200">{selectedRisk.controlDescription}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
              Tratamiento (ISO 31000)
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['mitigate', 'transfer', 'accept', 'avoid'] as const).map((treatmentKey) => {
                const isSelected = selectedRisk.treatment === treatmentKey;
                return (
                  <button
                    key={treatmentKey}
                    type="button"
                    onClick={() => updateSelectedRisk({ treatment: treatmentKey as RiskTreatmentKind })}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? 'border-violet-400 bg-violet-500/25 text-violet-100'
                        : 'border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {TREATMENT_CONFIG[treatmentKey].label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-400">
              {TREATMENT_CONFIG[selectedRisk.treatment].description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5">
            <div className="text-[10px] font-bold uppercase text-zinc-400">Riesgo Inherente</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-base font-black text-zinc-100">
                {selectedRisk.inherentProbability} × {selectedRisk.inherentImpact} = {inherentScore}
              </span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                  RISK_LEVEL_CONFIG[inherentLevel].badgeClass
                }`}
              >
                {RISK_LEVEL_CONFIG[inherentLevel].label}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5">
            <div className="text-[10px] font-bold uppercase text-zinc-400">Riesgo Residual</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-base font-black text-zinc-100">
                {residual.probability} × {residual.impact} = {residual.score}
              </span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                  RISK_LEVEL_CONFIG[residual.level].badgeClass
                }`}
              >
                {RISK_LEVEL_CONFIG[residual.level].label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

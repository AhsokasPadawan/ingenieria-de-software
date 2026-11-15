import { Award } from 'lucide-react';
import {
  CriterionKey,
  MATRIX_CRITERIA,
  MATRIX_PRESETS,
  VendorProfile,
} from './weightedVendorMatrixData';

function computeVendorWeightedScore(
  vendor: VendorProfile,
  weights: Record<CriterionKey, number>,
): number {
  const weightedSum =
    vendor.scores.cost * weights.cost +
    vendor.scores.quality * weights.quality +
    vendor.scores.support * weights.support;
  return weightedSum / 100;
}

export interface MatrixCalculatorStageProps {
  weights: Record<CriterionKey, number>;
  vendors: readonly VendorProfile[];
  onWeightChange: (key: CriterionKey, value: number) => void;
  onScoreChange: (vendorId: string, key: CriterionKey, value: number) => void;
  onApplyPreset: (presetWeights: Record<CriterionKey, number>) => void;
  onNormalizeWeights: () => void;
}

export function MatrixCalculatorStage({
  weights,
  vendors,
  onWeightChange,
  onScoreChange,
  onApplyPreset,
  onNormalizeWeights,
}: MatrixCalculatorStageProps) {
  const totalWeight = weights.cost + weights.quality + weights.support;
  const isBalanced = totalWeight === 100;

  const rankedVendors = vendors
    .map((vendor) => ({
      vendor,
      score: computeVendorWeightedScore(vendor, weights),
    }))
    .sort((a, b) => b.score - a.score);

  const winnerId = rankedVendors[0]?.vendor.id;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {MATRIX_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.weights)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-200 transition hover:border-emerald-600 hover:bg-zinc-800"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-md border px-2 py-0.5 text-xs font-mono font-bold ${
              isBalanced
                ? 'border-emerald-700 bg-emerald-950/60 text-emerald-300'
                : 'border-amber-700 bg-amber-950/60 text-amber-300'
            }`}
          >
            Suma pesos: {totalWeight}%
          </span>
          {!isBalanced && (
            <button
              type="button"
              onClick={onNormalizeWeights}
              className="rounded-md border border-amber-600 bg-amber-900/40 px-2 py-0.5 text-xs font-bold text-amber-200 transition hover:bg-amber-800/60"
            >
              Normalizar 100%
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="px-3 py-2 font-bold">Criterio y Peso (%)</th>
              {vendors.map((vendor) => {
                const isWinner = vendor.id === winnerId;
                return (
                  <th key={vendor.id} className="px-3 py-2 font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className={isWinner ? 'text-emerald-300' : 'text-zinc-200'}>
                        {vendor.name}
                      </span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-normal text-zinc-400">
                        {vendor.tag}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {MATRIX_CRITERIA.map((criterion) => (
              <tr key={criterion.key} className="border-b border-zinc-800/70">
                <td className="px-3 py-1.5 align-middle min-w-[180px]" title={criterion.helperText}>
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-bold text-zinc-200">{criterion.label}</span>
                    <span className="font-mono font-bold text-emerald-300">
                      {weights[criterion.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={weights[criterion.key]}
                    aria-label={`Peso para ${criterion.label}`}
                    onChange={(event) =>
                      onWeightChange(criterion.key, Number(event.target.value))
                    }
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </td>

                {vendors.map((vendor) => (
                  <td key={vendor.id} className="px-3 py-1.5 align-middle min-w-[125px]">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-zinc-400">Puntaje</span>
                      <span className="font-mono font-bold text-zinc-100">
                        {vendor.scores[criterion.key]}/10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={vendor.scores[criterion.key]}
                      aria-label={`Puntaje de ${vendor.name} en ${criterion.label}`}
                      onChange={(event) =>
                        onScoreChange(vendor.id, criterion.key, Number(event.target.value))
                      }
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {rankedVendors.map((entry, idx) => {
          const isWinner = idx === 0;
          const percentage = Math.min(100, Math.round((entry.score / 10) * 100));
          return (
            <div
              key={entry.vendor.id}
              className={`rounded-xl border p-2 transition ${
                isWinner
                  ? 'border-emerald-600 bg-emerald-950/40'
                  : 'border-zinc-800 bg-zinc-900/70'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  {isWinner && <Award className="h-4 w-4 text-emerald-400" />}
                  <span className={isWinner ? 'text-emerald-200' : 'text-zinc-200'}>
                    #{idx + 1} {entry.vendor.name}
                  </span>
                </span>
                <span className="font-mono text-sm text-emerald-300">
                  {entry.score.toFixed(2)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isWinner ? 'bg-emerald-400' : 'bg-zinc-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

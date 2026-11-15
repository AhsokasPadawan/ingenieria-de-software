import { useState } from 'react';
import { Scale, SlidersHorizontal } from 'lucide-react';
import { useSectionTheme } from '../../core/domain/sectionThemes';
import { CoreVsCommodityStage } from './CoreVsCommodityStage';
import { MatrixCalculatorStage } from './MatrixCalculatorStage';
import { InteractiveVisualizerShell } from './shared/InteractiveVisualizerShell';
import {
  BPO_EXAMPLE_PRESETS,
  BpoFactorAnswer,
  CriterionKey,
  INITIAL_VENDORS,
  MATRIX_PRESETS,
  VendorMatrixTabKind,
  VendorProfile,
} from './weightedVendorMatrixData';

const TAB_TITLES: Record<VendorMatrixTabKind, { label: string; title: string }> = {
  matrix: {
    label: 'Matriz Ponderada (RFP)',
    title: 'Calculadora de Matriz de Decisión Ponderada',
  },
  classifier: {
    label: 'Core vs. Commodity (BPO)',
    title: 'Clasificador Core vs. Commodity y Prueba de Modularidad',
  },
};

function computeNormalizedWeights(
  weights: Record<CriterionKey, number>,
): Record<CriterionKey, number> {
  const total = weights.cost + weights.quality + weights.support;
  if (total <= 0) {
    return { cost: 34, quality: 33, support: 33 };
  }
  const costNorm = Math.round((weights.cost / total) * 100);
  const qualityNorm = Math.round((weights.quality / total) * 100);
  const supportNorm = Math.max(0, 100 - costNorm - qualityNorm);
  return { cost: costNorm, quality: qualityNorm, support: supportNorm };
}

export function WeightedVendorMatrixVisualizer() {
  const sectionTheme = useSectionTheme();
  const [activeTab, setActiveTab] = useState<VendorMatrixTabKind>('matrix');
  const [weights, setWeights] = useState<Record<CriterionKey, number>>(
    MATRIX_PRESETS[0].weights,
  );
  const [vendors, setVendors] = useState<readonly VendorProfile[]>(INITIAL_VENDORS);
  const [bpoAnswers, setBpoAnswers] = useState<BpoFactorAnswer>(
    BPO_EXAMPLE_PRESETS[0].answers,
  );

  const handleWeightChange = (key: CriterionKey, value: number) => {
    setWeights((previous) => ({ ...previous, [key]: value }));
  };

  const handleScoreChange = (
    vendorId: string,
    key: CriterionKey,
    value: number,
  ) => {
    setVendors((previous) =>
      previous.map((vendor) =>
        vendor.id === vendorId
          ? { ...vendor, scores: { ...vendor.scores, [key]: value } }
          : vendor,
      ),
    );
  };

  const handleNormalizeWeights = () => {
    setWeights((previous) => computeNormalizedWeights(previous));
  };

  const handleBpoAnswerChange = (key: keyof BpoFactorAnswer, value: number) => {
    setBpoAnswers((previous) => ({ ...previous, [key]: value }));
  };

  const tabActions = (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="tablist"
      aria-label="Herramientas de Unidad 3"
    >
      {(['matrix', 'classifier'] as const).map((tabKey) => {
        const isSelected = activeTab === tabKey;
        return (
          <button
            key={tabKey}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => setActiveTab(tabKey)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
              isSelected
                ? sectionTheme.primaryButtonClass
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {tabKey === 'matrix' ? (
              <Scale className="h-3.5 w-3.5" />
            ) : (
              <SlidersHorizontal className="h-3.5 w-3.5" />
            )}
            <span>{TAB_TITLES[tabKey].label}</span>
          </button>
        );
      })}
    </div>
  );

  const footerText =
    activeTab === 'matrix'
      ? 'La matriz ponderada reduce la subjetividad en el RFP: cambiar los pesos según la criticidad del negocio puede invertir el ranking ganador.'
      : 'Prueba de modularidad + Core vs. Commodity: tercerizá lo que tiene interfaz limpia y baja diferenciación; protegé el núcleo del negocio.';

  return (
    <InteractiveVisualizerShell
      title={TAB_TITLES[activeTab].title}
      badge="Unidad 3 · BPO & RFP"
      headerActions={tabActions}
      footerBanner={footerText}
    >
      {activeTab === 'matrix' ? (
        <MatrixCalculatorStage
          weights={weights}
          vendors={vendors}
          onWeightChange={handleWeightChange}
          onScoreChange={handleScoreChange}
          onApplyPreset={(presetWeights) => setWeights(presetWeights)}
          onNormalizeWeights={handleNormalizeWeights}
        />
      ) : (
        <CoreVsCommodityStage
          answers={bpoAnswers}
          onChangeAnswer={handleBpoAnswerChange}
          onApplyExample={(example) => setBpoAnswers(example)}
        />
      )}
    </InteractiveVisualizerShell>
  );
}

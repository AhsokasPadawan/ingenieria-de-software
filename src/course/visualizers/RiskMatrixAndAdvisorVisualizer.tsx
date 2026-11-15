import { useState } from 'react';
import { Bot, ShieldAlert } from 'lucide-react';
import { useSectionTheme } from '../../core/domain/sectionThemes';
import { AdvisorFlowStage } from './AdvisorFlowStage';
import { GOVERNANCE_TAB_CONFIG, GovernanceTabKind } from './riskMatrixAndAdvisorData';
import { RiskMatrixStage } from './RiskMatrixStage';
import { InteractiveVisualizerShell } from './shared/InteractiveVisualizerShell';

export function RiskMatrixAndAdvisorVisualizer() {
  const sectionTheme = useSectionTheme();
  const [activeTab, setActiveTab] = useState<GovernanceTabKind>('risk-matrix');

  const headerActions = (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="tablist"
      aria-label="Herramientas de Unidad 5"
    >
      {(['risk-matrix', 'advisor-flow'] as const).map((tabKey) => {
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
            {tabKey === 'risk-matrix' ? (
              <ShieldAlert className="h-3.5 w-3.5" />
            ) : (
              <Bot className="h-3.5 w-3.5" />
            )}
            <span>{GOVERNANCE_TAB_CONFIG[tabKey].label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <InteractiveVisualizerShell
      title={GOVERNANCE_TAB_CONFIG[activeTab].title}
      badge="Unidad 5 · Gobernanza & Riesgos"
      headerActions={headerActions}
      footerBanner={GOVERNANCE_TAB_CONFIG[activeTab].footer}
    >
      {activeTab === 'risk-matrix' ? <RiskMatrixStage /> : <AdvisorFlowStage />}
    </InteractiveVisualizerShell>
  );
}

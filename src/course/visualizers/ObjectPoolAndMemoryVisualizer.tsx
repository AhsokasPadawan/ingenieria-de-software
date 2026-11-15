import { useState } from 'react';
import { Cpu, Unlink } from 'lucide-react';
import { useSectionTheme } from '../../core/domain/sectionThemes';
import { MemoryLeakDisposeStage } from './MemoryLeakDisposeStage';
import { MEMORY_TAB_CONFIG, MemoryVisualizerTabKind } from './objectPoolAndMemoryData';
import { PoolVsGcStage } from './PoolVsGcStage';
import { InteractiveVisualizerShell } from './shared/InteractiveVisualizerShell';

export function ObjectPoolAndMemoryVisualizer() {
  const sectionTheme = useSectionTheme();
  const [activeTab, setActiveTab] = useState<MemoryVisualizerTabKind>('pool-vs-gc');

  const headerActions = (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="tablist"
      aria-label="Herramientas de Unidad 4"
    >
      {(['pool-vs-gc', 'leak-dispose'] as const).map((tabKey) => {
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
            {tabKey === 'pool-vs-gc' ? (
              <Cpu className="h-3.5 w-3.5" />
            ) : (
              <Unlink className="h-3.5 w-3.5" />
            )}
            <span>{MEMORY_TAB_CONFIG[tabKey].label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <InteractiveVisualizerShell
      title={MEMORY_TAB_CONFIG[activeTab].title}
      badge="Unidad 4 · CPU & RAM"
      headerActions={headerActions}
      footerBanner={MEMORY_TAB_CONFIG[activeTab].footer}
    >
      {activeTab === 'pool-vs-gc' ? <PoolVsGcStage /> : <MemoryLeakDisposeStage />}
    </InteractiveVisualizerShell>
  );
}

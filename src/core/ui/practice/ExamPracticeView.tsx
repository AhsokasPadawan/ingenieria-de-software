import { ReactNode, useState } from 'react';
import {
  ExamExerciseItem,
  ExamExerciseVisualResource,
  ExamParadigmCategory,
  ModuleId,
} from '../../domain/coreTypes';
import { SECTION_THEMES } from '../../domain/sectionThemes';
import { ExerciseWorkspace, WorkspaceCodeTokenizer } from './ExerciseWorkspace';
import { PracticeFilterOption } from './PracticeFilterBar';
import { PracticeStatementPanel } from './PracticeStatementPanel';
import { WorkspaceTab } from './WorkspaceHeaderBar';

export interface PracticeTabItem {
  id: string;
  label: string;
  items: readonly ExamExerciseItem[];
  itemSingularLabel?: string;
  paradigmFilters?: readonly PracticeFilterOption[];
  originFilters?: readonly PracticeFilterOption[];
}

export interface ExamPracticeViewProps {
  exercises: readonly ExamExerciseItem[];
  completedItemIds: string[];
  selectedExerciseId: string;
  selectedParadigmFilter?: ExamParadigmCategory;
  headingTitle?: string;
  itemSingularLabel?: string;
  practiceModuleId?: ModuleId;
  paradigmFilters?: readonly PracticeFilterOption[];
  originFilters?: readonly PracticeFilterOption[];
  practiceTabs?: readonly PracticeTabItem[];
  activePracticeTabId?: string;
  matchesCategory?: (
    exercise: ExamExerciseItem,
    selectedCategory: ExamParadigmCategory,
  ) => boolean;
  renderVisualResource?: (
    resource: ExamExerciseVisualResource | null | undefined,
    exerciseId: string,
  ) => ReactNode;
  resolveAllowedWorkspaceTabs?: (
    exercise: ExamExerciseItem,
    practiceTabId?: string,
  ) => readonly WorkspaceTab[];
  tokenizeCode?: WorkspaceCodeTokenizer;
  onSelectExercise: (exerciseId: string) => void;
  onSelectParadigmFilter?: (paradigm: ExamParadigmCategory) => void;
  onSelectPracticeTab?: (tabId: string) => void;
  onToggleCompletedItem: (itemId: string) => void;
}

export function ExamPracticeView({
  exercises,
  completedItemIds,
  selectedExerciseId,
  headingTitle = 'Banco de Ejercicios de Parcial y Patrones de Examen',
  itemSingularLabel = 'Ejercicio',
  practiceModuleId = 'fuchsia',
  practiceTabs,
  activePracticeTabId,
  renderVisualResource,
  resolveAllowedWorkspaceTabs,
  tokenizeCode,
  onSelectExercise,
  onSelectParadigmFilter,
  onSelectPracticeTab,
  onToggleCompletedItem,
}: ExamPracticeViewProps) {
  const [isStatementCollapsed, setIsStatementCollapsed] = useState<boolean>(false);
  const practiceTheme = SECTION_THEMES[practiceModuleId];
  const currentIndex = exercises.findIndex(
    (exercise) => exercise.id === selectedExerciseId,
  );
  const activeIndex = currentIndex !== -1 ? currentIndex : 0;
  const currentExercise = exercises[activeIndex] ?? exercises[0];
  const isCompleted = completedItemIds.includes(currentExercise.id);
  const allowedWorkspaceTabs = resolveAllowedWorkspaceTabs?.(
    currentExercise,
    activePracticeTabId,
  );

  const handleTabSwitch = (tab: PracticeTabItem) => {
    onSelectParadigmFilter?.('all');
    onSelectPracticeTab?.(tab.id);
    if (tab.items.length > 0) {
      onSelectExercise(tab.items[0].id);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full h-auto lg:h-full lg:flex-1 lg:overflow-hidden p-2.5 sm:p-4 pb-24 lg:pb-4">
      <h1 className="sr-only">{headingTitle}</h1>

      {practiceTabs && practiceTabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Modalidad de práctica"
          className={`flex shrink-0 items-center gap-2 rounded-2xl border bg-white/95 p-1.5 shadow-sm dark:bg-zinc-900 ${practiceTheme.cardBorderClass}`}
        >
          {practiceTabs.map((tab) => {
            const isActiveTab = tab.id === activePracticeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActiveTab}
                onClick={() => handleTabSwitch(tab)}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                  isActiveTab
                    ? practiceTheme.primaryButtonClass
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/70'
                }`}
              >
                <span>{tab.label}</span>
                <span className="rounded-md bg-black/10 px-1.5 py-0.5 text-[11px] font-mono dark:bg-white/10">
                  {tab.items.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3 w-full h-auto lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <PracticeStatementPanel
          currentExercise={currentExercise}
          itemSingularLabel={itemSingularLabel}
          isCompleted={isCompleted}
          isCollapsed={isStatementCollapsed}
          practiceTheme={practiceTheme}
          renderVisualResource={renderVisualResource}
          onToggleCollapse={() => setIsStatementCollapsed((previous) => !previous)}
          onToggleCompletedItem={onToggleCompletedItem}
        />

        <div className="w-full lg:flex-1 min-h-[480px] lg:min-h-0 flex flex-col overflow-visible lg:overflow-hidden">
          <ExerciseWorkspace
            key={currentExercise.id}
            exerciseId={currentExercise.id}
            exerciseTitle={currentExercise.title}
            allowedTabs={allowedWorkspaceTabs}
            tokenizeCode={tokenizeCode}
          />
        </div>
      </div>
    </div>
  );
}

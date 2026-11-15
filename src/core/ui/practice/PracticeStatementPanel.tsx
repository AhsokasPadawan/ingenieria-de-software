import { ReactNode } from 'react';
import { CheckCircle2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
  ExamExerciseItem,
  ExamExerciseVisualResource,
} from '../../domain/coreTypes';
import { SectionTheme } from '../../domain/sectionThemes';
import { MathFormula } from '../MathFormula';

export interface PracticeStatementPanelProps {
  currentExercise: ExamExerciseItem;
  itemSingularLabel?: string;
  isCompleted: boolean;
  isCollapsed?: boolean;
  practiceTheme: SectionTheme;
  renderVisualResource?: (
    resource: ExamExerciseVisualResource | null | undefined,
    exerciseId: string,
  ) => ReactNode;
  onToggleCollapse?: () => void;
  onToggleCompletedItem: (itemId: string) => void;
}

export function PracticeStatementPanel({
  currentExercise,
  itemSingularLabel = 'Ejercicio',
  isCompleted,
  isCollapsed = false,
  practiceTheme,
  renderVisualResource,
  onToggleCollapse,
  onToggleCompletedItem,
}: PracticeStatementPanelProps) {
  const isTask = itemSingularLabel.toLowerCase() === 'tarea';
  const completionAriaLabel = isTask
    ? isCompleted
      ? 'Tarea completada'
      : `Marcar tarea ${currentExercise.title} como completada`
    : isCompleted
      ? 'Ejercicio practicado'
      : `Marcar ejercicio ${currentExercise.title} como practicado`;
  const completionLabel = isTask
    ? isCompleted
      ? 'Tarea completada'
      : 'Marcar como completada'
    : isCompleted
      ? 'Ejercicio Practicado'
      : 'Marcar como practicado';
  if (isCollapsed) {
    return (
      <div
        className={`flex lg:flex-col items-center justify-between lg:justify-start gap-3 rounded-2xl border bg-white/95 p-2.5 shadow-sm w-full lg:w-12 shrink-0 dark:bg-zinc-900 ${practiceTheme.cardBorderClass}`}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expandir consigna"
          title="Expandir consigna"
          className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${practiceTheme.secondaryButtonClass}`}
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
        <span
          className={`text-xs font-bold uppercase tracking-wider lg:[writing-mode:vertical-rl] lg:rotate-180 ${practiceTheme.slideHeaderClass}`}
        >
          Consigna #{currentExercise.number}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border bg-white/95 p-4 shadow-sm w-full lg:w-[35%] shrink-0 overflow-visible lg:overflow-y-auto dark:bg-zinc-900 ${practiceTheme.cardBorderClass}`}
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex h-5.5 px-1.5 items-center justify-center rounded-lg text-xs font-extrabold ${practiceTheme.stepBadgeClass}`}
              >
                #{currentExercise.number}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${practiceTheme.slideBadgeClass}`}
              >
                {currentExercise.paradigm}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${practiceTheme.counterBoxClass}`}
              >
                {currentExercise.difficultyLabel}
              </span>
            </div>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Colapsar consigna"
                title="Colapsar consigna"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${practiceTheme.secondaryButtonClass}`}
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <h2 className={`text-base font-extrabold sm:text-lg ${practiceTheme.titleTextClass}`}>
            {currentExercise.title}
          </h2>

          <div
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${practiceTheme.formulaCardClass}`}
          >
            Objetivo: <MathFormula expression={currentExercise.targetComplexityLatex} />
          </div>
        </div>

        <div className={`border-t pt-2.5 ${practiceTheme.cardBorderClass}`}>
          <h3 className={`text-xs font-bold uppercase ${practiceTheme.slideHeaderClass}`}>
            Consigna Formal
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-700 sm:text-sm dark:text-zinc-300 whitespace-pre-line">
            {currentExercise.problemStatement}
          </p>
          {renderVisualResource?.(currentExercise.recursoVisual, currentExercise.id)}
        </div>
      </div>

      <div className={`pt-3 mt-3 border-t ${practiceTheme.cardBorderClass}`}>
        <button
          type="button"
          onClick={() => onToggleCompletedItem(currentExercise.id)}
          aria-label={completionAriaLabel}
          className={`flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
            isCompleted
              ? practiceTheme.primaryButtonClass
              : practiceTheme.secondaryButtonClass
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{completionLabel}</span>
        </button>
      </div>
    </div>
  );
}

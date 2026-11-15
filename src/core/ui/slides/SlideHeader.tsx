import { Terminal } from 'lucide-react';
import { ConceptSlide } from '../../domain/coreTypes';
import { SectionTheme } from '../../domain/sectionThemes';

export interface SlideHeaderProps {
  slide: ConceptSlide;
  moduleSlideIndex: number;
  moduleSlidesCount: number;
  isExercise: boolean;
  exerciseNumber?: number;
  sectionTheme: SectionTheme;
  onOpenWorkspace?: () => void;
}

export function SlideHeader({
  slide,
  moduleSlideIndex,
  moduleSlidesCount,
  isExercise,
  exerciseNumber,
  sectionTheme,
  onOpenWorkspace,
}: SlideHeaderProps) {
  return (
    <div
      className={`shrink-0 border-b pb-2.5 ${sectionTheme.cardBorderClass} flex items-center justify-between gap-3`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${sectionTheme.slideBadgeClass}`}
          >
            {isExercise && exerciseNumber !== undefined
              ? `Ejercicio #${exerciseNumber}`
              : `Diapositiva #${moduleSlideIndex + 1}`}
          </span>
          <h1
            className={`text-xs sm:text-sm font-black uppercase tracking-wider truncate ${sectionTheme.slideHeaderClass}`}
          >
            {slide.moduleTitle}
          </h1>
        </div>
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight truncate mt-0.5 ${sectionTheme.titleTextClass}`}
        >
          {slide.conceptTitle}
        </h2>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {onOpenWorkspace && (
          <button
            type="button"
            onClick={onOpenWorkspace}
            aria-label="Abrir workspace del módulo"
            title="Abrir workspace de código y pizarrón"
            className="inline-flex items-center gap-1.5 rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/80 px-3 py-2 text-xs font-bold text-fuchsia-200 shadow-xs transition hover:border-fuchsia-400 hover:bg-fuchsia-900 hover:text-white active:scale-95"
          >
            <Terminal className="h-4 w-4 text-fuchsia-400" />
            <span className="hidden sm:inline">Workspace</span>
          </button>
        )}

        <div
          className={`rounded-xl border px-3.5 py-1 text-center ${sectionTheme.counterBoxClass}`}
        >
          <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider leading-none opacity-80">
            {isExercise && exerciseNumber !== undefined ? 'Ejercicio' : 'Diapositiva'}
          </div>
          <div className="font-mono text-sm sm:text-base md:text-lg font-black leading-tight">
            {isExercise && exerciseNumber !== undefined ? (
              `#${exerciseNumber}`
            ) : (
              <>
                {moduleSlideIndex + 1}{' '}
                <span className="text-xs font-normal opacity-60">/ {moduleSlidesCount}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

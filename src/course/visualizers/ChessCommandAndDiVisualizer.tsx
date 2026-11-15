import { useState } from 'react';
import { ArrowRight, CheckCircle2, Layers, RotateCcw, ShieldAlert, Undo2 } from 'lucide-react';
import { useSectionTheme } from '../../core/domain/sectionThemes';
import { AnimationPlayerShell } from '../../core/ui/AnimationPlayerShell';
import {
  BOARD_COLUMN_LABELS,
  BOARD_ROW_LABELS,
  CHESS_COMMAND_STEPS,
  ChessBoardPiece,
  ChessCommandStepFrame,
  ChessDiTabKind,
  DI_LEVEL_STEPS,
  DiLevelStepFrame,
} from './chessCommandAndDiData';
import { useVisualizerPlayback } from './shared/useVisualizerPlayback';

const TAB_CONFIG: Record<ChessDiTabKind, { label: string; title: string }> = {
  command: {
    label: 'Command (Ajedrez)',
    title: 'Patrón Command: Execute() / Undo() con Captura',
  },
  di: {
    label: '4 Niveles de DI',
    title: 'Evolución de Dependencias: de new a Constructor DI',
  },
};

const DI_ARROW_LABELS: Record<DiLevelStepFrame['dependencyDirection'], string> = {
  direct: 'new concreto (acoplado)',
  global: 'Singleton global',
  hidden: 'registro oculto',
  inverted: 'inyectado por constructor',
};

function ChessCommandStage({
  frame,
  currentStep,
  totalSteps,
  onStepChange,
}: {
  frame: ChessCommandStepFrame;
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
}) {
  const piecesByCoord: Record<string, ChessBoardPiece> = Object.fromEntries(
    frame.pieces.map((piece) => [`${piece.row}-${piece.col}`, piece]),
  );

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
      <div className="md:col-span-6 flex flex-col items-center gap-2">
        <div className="inline-grid grid-cols-5 gap-1 rounded-xl border border-zinc-700 bg-zinc-900 p-1.5">
          {BOARD_ROW_LABELS.map((rowLabel, rowIdx) =>
            BOARD_COLUMN_LABELS.map((colLabel, colIdx) => {
              const coordKey = `${rowIdx}-${colIdx}`;
              const isDarkSquare = (rowIdx + colIdx) % 2 === 1;
              const isHighlighted = frame.highlightedSquares.includes(coordKey);
              const piece = piecesByCoord[coordKey];
              return (
                <div
                  key={coordKey}
                  className={`relative flex h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 items-center justify-center rounded-md border text-lg sm:text-xl transition ${
                    isHighlighted
                      ? 'border-amber-400 bg-amber-500/25 ring-2 ring-amber-400/50'
                      : isDarkSquare
                        ? 'border-zinc-800 bg-zinc-800/90'
                        : 'border-zinc-700 bg-zinc-700/40'
                  }`}
                >
                  <span className="absolute top-0.5 left-1 text-[8px] font-mono text-zinc-400">
                    {colLabel}
                    {rowLabel}
                  </span>
                  {piece && (
                    <span
                      title={piece.label}
                      className={
                        piece.color === 'white'
                          ? 'text-sky-200 drop-shadow-xs'
                          : 'text-rose-300 drop-shadow-xs'
                      }
                    >
                      {piece.symbol}
                    </span>
                  )}
                </div>
              );
            }),
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={currentStep >= totalSteps - 1}
            onClick={() => onStepChange(currentStep + 1)}
            className="flex items-center gap-1 rounded-lg border border-sky-700 bg-sky-950/70 px-2.5 py-1 text-xs font-bold text-sky-200 transition hover:bg-sky-900/70 disabled:opacity-40"
          >
            <span>{currentStep < 2 ? 'Execute()' : 'Undo()'}</span>
          </button>
          <button
            type="button"
            disabled={currentStep === 0}
            onClick={() => onStepChange(currentStep - 1)}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-bold text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span>Paso anterior</span>
          </button>
          <button
            type="button"
            disabled={currentStep === 0}
            onClick={() => onStepChange(0)}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-bold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="md:col-span-6 flex flex-col gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Pila de Historial (Stack&lt;ICommand&gt;)
            </span>
            <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-300 border border-sky-800/70">
              {frame.actionTag}
            </span>
          </div>

          {frame.commandStack.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-700 py-4 text-center text-xs font-mono text-zinc-500">
              [ Pila vacía ]
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-1.5">
              {frame.commandStack.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-sky-800/60 bg-sky-950/40 px-3 py-2 text-xs font-mono"
                >
                  <span className="text-sky-200 font-semibold">
                    #{idx + 1} {entry.signature}
                  </span>
                  {entry.capturedLabel && (
                    <span className="rounded bg-amber-950/80 border border-amber-700/60 px-1.5 py-0.5 text-[10px] text-amber-300">
                      {entry.capturedLabel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Operación en C#
          </div>
          <code className="text-xs font-mono text-emerald-300">{frame.codeLine}</code>
        </div>
      </div>
    </div>
  );
}

function DiLevelsStage({
  frame,
  onSelectLevel,
}: {
  frame: DiLevelStepFrame;
  onSelectLevel: (stepIndex: number) => void;
}) {
  return (
    <div className="w-full flex flex-col gap-2.5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {DI_LEVEL_STEPS.map((item, idx) => {
          const isCurrent = item.levelNumber === frame.levelNumber;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectLevel(idx)}
              className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                isCurrent
                  ? 'border-sky-500 bg-sky-950/60 text-sky-100 font-bold'
                  : 'border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-75">
                Nivel {item.levelNumber}
              </div>
              <div className="truncate">{item.couplingBadge}</div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <div className="rounded-xl border border-sky-700 bg-sky-950/50 px-3.5 py-2 text-center min-w-[130px]">
          <div className="text-[10px] uppercase tracking-wider text-sky-400 font-bold">
            Núcleo
          </div>
          <div className="text-sm font-bold text-zinc-100">{frame.callerLabel}</div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <ArrowRight
            className={`h-5 w-5 ${frame.isTestable ? 'text-emerald-400' : 'text-amber-400'}`}
          />
          <span className="text-[10px] font-mono text-zinc-400 text-center">
            {DI_ARROW_LABELS[frame.dependencyDirection]}
          </span>
        </div>

        {frame.interfaceLabel && (
          <>
            <div
              className={`rounded-xl border px-3.5 py-2.5 text-center min-w-[145px] ${
                frame.isTestable
                  ? 'border-emerald-600 bg-emerald-950/40'
                  : 'border-amber-700 bg-amber-950/30'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                Abstracción
              </div>
              <div className="text-xs font-mono font-bold text-zinc-100">
                {frame.interfaceLabel}
              </div>
            </div>

            <ArrowRight
              className={`h-5 w-5 ${frame.isTestable ? 'text-emerald-400' : 'text-zinc-500'}`}
            />
          </>
        )}

        <div className="rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-center min-w-[150px]">
          <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
            Implementación
          </div>
          <div className="text-xs font-mono font-bold text-zinc-200">{frame.concreteLabel}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-stretch">
        <pre className="md:col-span-8 rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-[11px] font-mono text-sky-200 overflow-x-auto leading-snug">
          {frame.csharpSnippet}
        </pre>

        <div className="md:col-span-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5 flex flex-col justify-center gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {frame.isTestable ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            )}
            <span className={frame.isTestable ? 'text-emerald-300' : 'text-amber-300'}>
              {frame.testabilityBadge}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span>{frame.couplingBadge}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChessCommandAndDiVisualizer() {
  const sectionTheme = useSectionTheme();
  const [activeTab, setActiveTab] = useState<ChessDiTabKind>('command');

  const commandPlayback = useVisualizerPlayback(CHESS_COMMAND_STEPS);
  const diPlayback = useVisualizerPlayback(DI_LEVEL_STEPS);

  const isCommandTab = activeTab === 'command';
  const activePlayback = isCommandTab ? commandPlayback : diPlayback;
  const activeTitle = TAB_CONFIG[activeTab].title;
  const activeStepTitle = activePlayback.currentFrame.title;
  const activeStepDescription = activePlayback.currentFrame.description;

  const handleSelectTab = (tab: ChessDiTabKind) => {
    setActiveTab(tab);
    if (commandPlayback.isPlaying) commandPlayback.togglePlay();
    if (diPlayback.isPlaying) diPlayback.togglePlay();
  };

  return (
    <AnimationPlayerShell
      title={activeTitle}
      badge="Unidad 1 · Command & DI"
      currentStep={activePlayback.currentStep}
      totalSteps={activePlayback.totalSteps}
      isPlaying={activePlayback.isPlaying}
      playbackSpeed={activePlayback.playbackSpeed}
      onStepChange={activePlayback.setCurrentStep}
      onTogglePlay={activePlayback.togglePlay}
      onSpeedChange={activePlayback.setPlaybackSpeed}
      onReset={activePlayback.resetPlayback}
      stepDescription={
        <div className="flex flex-col gap-0.5">
          <span className="font-bold">{activeStepTitle}</span>
          <span>{activeStepDescription}</span>
        </div>
      }
    >
      <div className="w-full flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Modos de Unidad 1">
          {(['command', 'di'] as const).map((tabKey) => {
            const isSelected = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectTab(tabKey)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  isSelected
                    ? sectionTheme.primaryButtonClass
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {TAB_CONFIG[tabKey].label}
              </button>
            );
          })}
        </div>

        {isCommandTab ? (
          <ChessCommandStage
            frame={commandPlayback.currentFrame}
            currentStep={commandPlayback.currentStep}
            totalSteps={commandPlayback.totalSteps}
            onStepChange={commandPlayback.setCurrentStep}
          />
        ) : (
          <DiLevelsStage
            frame={diPlayback.currentFrame}
            onSelectLevel={diPlayback.setCurrentStep}
          />
        )}
      </div>
    </AnimationPlayerShell>
  );
}

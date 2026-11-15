import { useState } from 'react';
import { useSectionTheme } from '../../core/domain/sectionThemes';
import { AnimationPlayerShell } from '../../core/ui/AnimationPlayerShell';
import {
  ARCHITECTURE_ORDER,
  ARCHITECTURE_SCENARIOS,
  ArchitectureEdgeSpec,
  ArchitectureKind,
  ArchitectureNodeSpec,
} from './architectureFlowData';
import { useVisualizerPlayback } from './shared/useVisualizerPlayback';

interface RoleVisualStyle {
  fill: string;
  stroke: string;
  activeFill: string;
  activeStroke: string;
  text: string;
}

const ROLE_VISUAL_STYLES: Record<ArchitectureNodeSpec['role'], RoleVisualStyle> = {
  external: {
    fill: '#18181b',
    stroke: '#52525b',
    activeFill: '#27272a',
    activeStroke: '#a1a1aa',
    text: '#e4e4e7',
  },
  port: {
    fill: '#1c1917',
    stroke: '#78716c',
    activeFill: '#292524',
    activeStroke: '#fbbf24',
    text: '#fef3c7',
  },
  core: {
    fill: '#1c1917',
    stroke: '#a8a29e',
    activeFill: '#451a03',
    activeStroke: '#f59e0b',
    text: '#fef3c7',
  },
  data: {
    fill: '#09090b',
    stroke: '#3f3f46',
    activeFill: '#064e3b',
    activeStroke: '#34d399',
    text: '#d1fae5',
  },
  system: {
    fill: '#0f172a',
    stroke: '#475569',
    activeFill: '#0c4a6e',
    activeStroke: '#38bdf8',
    text: '#e0f2fe',
  },
};

function computeNodeAnchorPair(
  fromNode: ArchitectureNodeSpec,
  toNode: ArchitectureNodeSpec,
) {
  const fromCenterX = fromNode.x + fromNode.width / 2;
  const fromCenterY = fromNode.y + fromNode.height / 2;
  const toCenterX = toNode.x + toNode.width / 2;
  const toCenterY = toNode.y + toNode.height / 2;

  const deltaX = toCenterX - fromCenterX;
  const deltaY = toCenterY - fromCenterY;

  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    const startX = deltaX >= 0 ? fromNode.x + fromNode.width : fromNode.x;
    const endX = deltaX >= 0 ? toNode.x : toNode.x + toNode.width;
    return {
      x1: startX,
      y1: fromCenterY,
      x2: endX,
      y2: toCenterY,
    };
  }

  const startY = deltaY >= 0 ? fromNode.y + fromNode.height : fromNode.y;
  const endY = deltaY >= 0 ? toNode.y : toNode.y + toNode.height;
  return {
    x1: fromCenterX,
    y1: startY,
    x2: toCenterX,
    y2: endY,
  };
}

function ArchitectureEdgeSvg({
  edge,
  nodesById,
  isActive,
}: {
  edge: ArchitectureEdgeSpec;
  nodesById: Record<string, ArchitectureNodeSpec>;
  isActive: boolean;
}) {
  const fromNode = nodesById[edge.fromId];
  const toNode = nodesById[edge.toId];
  if (!fromNode || !toNode) return null;

  const { x1, y1, x2, y2 } = computeNodeAnchorPair(fromNode, toNode);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const isDependency = edge.kind === 'dependency';
  const strokeColor = isActive
    ? isDependency
      ? '#f59e0b'
      : '#38bdf8'
    : '#52525b';
  const markerEnd = isActive
    ? isDependency
      ? 'url(#arch-arrow-dep-active)'
      : 'url(#arch-arrow-flow-active)'
    : 'url(#arch-arrow-idle)';

  const dashArray = isDependency ? (isActive ? '8 5' : undefined) : '5 4';

  return (
    <g opacity={isActive ? 1 : 0.42}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth={isActive ? 2.5 : 1.5}
        strokeDasharray={dashArray}
        markerEnd={markerEnd}
      >
        {isActive && (
          <animate
            attributeName="stroke-dashoffset"
            from="26"
            to="0"
            dur="1.1s"
            repeatCount="indefinite"
          />
        )}
      </line>
      {edge.label && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-36}
            y={-9}
            width={72}
            height={18}
            rx={5}
            fill="#09090b"
            stroke={strokeColor}
            strokeWidth={0.8}
          />
          <text
            x={0}
            y={3.5}
            textAnchor="middle"
            fill={isActive ? '#fef3c7' : '#a1a1aa'}
            fontSize={9}
            fontWeight={600}
            fontFamily="ui-monospace, monospace"
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
}

export function ArchitectureFlowVisualizer() {
  const sectionTheme = useSectionTheme();
  const [selectedArchitecture, setSelectedArchitecture] =
    useState<ArchitectureKind>('layered');

  const scenario = ARCHITECTURE_SCENARIOS[selectedArchitecture];
  const playback = useVisualizerPlayback(scenario.steps);
  const activeStep = playback.currentFrame;

  const nodesById: Record<string, ArchitectureNodeSpec> = Object.fromEntries(
    scenario.nodes.map((node) => [node.id, node]),
  );

  const handleSelectArchitecture = (kind: ArchitectureKind) => {
    setSelectedArchitecture(kind);
    playback.resetPlayback();
    if (playback.isPlaying) {
      playback.togglePlay();
    }
  };

  return (
    <AnimationPlayerShell
      title={scenario.title}
      badge="Unidad 0 · Arquitecturas"
      currentStep={playback.currentStep}
      totalSteps={playback.totalSteps}
      isPlaying={playback.isPlaying}
      playbackSpeed={playback.playbackSpeed}
      onStepChange={playback.setCurrentStep}
      onTogglePlay={playback.togglePlay}
      onSpeedChange={playback.setPlaybackSpeed}
      onReset={playback.resetPlayback}
      stepDescription={
        <div className="flex flex-col gap-0.5">
          <span className="font-bold">{activeStep.title}</span>
          <span>{activeStep.description}</span>
        </div>
      }
    >
      <div className="w-full flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Estilos de arquitectura">
            {ARCHITECTURE_ORDER.map((kind) => {
              const item = ARCHITECTURE_SCENARIOS[kind];
              const isSelected = selectedArchitecture === kind;
              return (
                <button
                  key={kind}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectArchitecture(kind)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                    isSelected
                      ? sectionTheme.primaryButtonClass
                      : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {item.tabLabel}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 bg-amber-400" />
              Dependencia
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-sky-400" />
              Asociación / Flujo
            </span>
          </div>
        </div>

        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-1.5">
          <svg
            viewBox="0 0 640 302"
            className="w-full h-44 sm:h-48 lg:h-52 select-none"
            role="img"
            aria-label={`Diagrama de ${scenario.title}`}
          >
            <defs>
              <marker
                id="arch-arrow-idle"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#52525b" />
              </marker>
              <marker
                id="arch-arrow-dep-active"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
              </marker>
              <marker
                id="arch-arrow-flow-active"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
              </marker>
            </defs>

            {scenario.edges.map((edge) => (
              <ArchitectureEdgeSvg
                key={edge.id}
                edge={edge}
                nodesById={nodesById}
                isActive={activeStep.activeEdgeIds.includes(edge.id)}
              />
            ))}

            {scenario.nodes.map((node) => {
              const style = ROLE_VISUAL_STYLES[node.role];
              const isActive = activeStep.activeNodeIds.includes(node.id);
              return (
                <g key={node.id} opacity={isActive ? 1 : 0.45}>
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={10}
                    fill={isActive ? style.activeFill : style.fill}
                    stroke={isActive ? style.activeStroke : style.stroke}
                    strokeWidth={isActive ? 2.2 : 1.2}
                  />
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 - 4}
                    textAnchor="middle"
                    fill={isActive ? style.text : '#a1a1aa'}
                    fontSize={12}
                    fontWeight={700}
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 + 12}
                    textAnchor="middle"
                    fill={isActive ? '#d4d4d8' : '#71717a'}
                    fontSize={10}
                    fontFamily="ui-monospace, monospace"
                  >
                    {node.sublabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Dirección de Dependencias
            </div>
            <div className="font-semibold text-amber-300 mt-0.5">{scenario.dependencyRule}</div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Acoplamiento
            </div>
            <div className="font-semibold text-zinc-200 mt-0.5">{scenario.couplingSummary}</div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-2.5 py-1.5">
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              Paso Actual
            </div>
            <div className="font-mono text-sky-300 mt-0.5 truncate">{activeStep.flowCaption}</div>
          </div>
        </div>
      </div>
    </AnimationPlayerShell>
  );
}

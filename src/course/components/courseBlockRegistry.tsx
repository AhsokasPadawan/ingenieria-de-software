import { ReactNode } from 'react';
import {
  SlideBlockComponentProps,
  SlideBlockRegistry,
} from '../../core/ui/slides/defaultBlockRegistry';
import { TheorySlideBlock } from '../../core/ui/slides/TheorySlideBlock';
import {
  CodeSlideBlock,
  ComplexitySlideBlock,
  CourseExerciseSlideBlock,
} from './CourseSlideBlocks';
import { ArchitectureFlowVisualizer } from '../visualizers/ArchitectureFlowVisualizer';
import { ChessCommandAndDiVisualizer } from '../visualizers/ChessCommandAndDiVisualizer';
import { HmacAuditChainVisualizer } from '../visualizers/HmacAuditChainVisualizer';
import { ObjectPoolAndMemoryVisualizer } from '../visualizers/ObjectPoolAndMemoryVisualizer';
import { RiskMatrixAndAdvisorVisualizer } from '../visualizers/RiskMatrixAndAdvisorVisualizer';
import { WeightedVendorMatrixVisualizer } from '../visualizers/WeightedVendorMatrixVisualizer';

export const VISUALIZER_LOOKUP: Record<string, () => ReactNode> = {
  'architecture-flow': () => <ArchitectureFlowVisualizer />,
  'chess-command-di': () => <ChessCommandAndDiVisualizer />,
  'weighted-vendor-matrix': () => <WeightedVendorMatrixVisualizer />,
  'object-pool-memory': () => <ObjectPoolAndMemoryVisualizer />,
  'risk-matrix-advisor': () => <RiskMatrixAndAdvisorVisualizer />,
  'hmac-audit-chain': () => <HmacAuditChainVisualizer />,
};

function VisualizerSlideBlock({ slide }: SlideBlockComponentProps) {
  if (!slide.visualizerId) return null;
  return (
    <div className="min-h-full flex-1 flex flex-col">
      {VISUALIZER_LOOKUP[slide.visualizerId]?.()}
    </div>
  );
}

export const COURSE_BLOCK_REGISTRY: SlideBlockRegistry = {
  theory: TheorySlideBlock,
  visualizer: VisualizerSlideBlock,
  pseudocode: CodeSlideBlock,
  code: CodeSlideBlock,
  complexity: ComplexitySlideBlock,
  exercise: CourseExerciseSlideBlock,
};

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SECTION_THEMES, SectionThemeContext } from '../../core/domain/sectionThemes';
import { COURSE_SLIDE_DECK } from '../data/courseModulesData';
import { ArchitectureFlowVisualizer } from './ArchitectureFlowVisualizer';
import { ChessCommandAndDiVisualizer } from './ChessCommandAndDiVisualizer';
import { WeightedVendorMatrixVisualizer } from './WeightedVendorMatrixVisualizer';

function renderWithTheme(ui: React.ReactElement, moduleId: string) {
  return render(
    <SectionThemeContext.Provider value={SECTION_THEMES[moduleId]}>
      {ui}
    </SectionThemeContext.Provider>,
  );
}

describe('Sesión 2 Visualizers', () => {
  it('links Unit 00, 01, and 03 concepts to visualizer slides in COURSE_SLIDE_DECK', () => {
    const visualizerIds = new Set(
      COURSE_SLIDE_DECK.filter((slide) => slide.slideKind === 'visualizer').map(
        (slide) => slide.visualizerId,
      ),
    );
    expect(visualizerIds.has('architecture-flow')).toBe(true);
    expect(visualizerIds.has('chess-command-di')).toBe(true);
    expect(visualizerIds.has('weighted-vendor-matrix')).toBe(true);
  });

  it('ArchitectureFlowVisualizer switches between Capas, Hexagonal, and ECS', () => {
    renderWithTheme(<ArchitectureFlowVisualizer />, 'module-0-repaso');

    expect(screen.getByText('Arquitectura en Capas')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Hexagonal' }));
    expect(screen.getByText('Arquitectura Hexagonal (Puertos y Adaptadores)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'ECS' }));
    expect(screen.getByText('Entity-Component-System (ECS)')).toBeInTheDocument();
  });

  it('ChessCommandAndDiVisualizer simulates Execute/Undo and 4 DI levels', () => {
    renderWithTheme(<ChessCommandAndDiVisualizer />, 'module-1-ingenio');

    expect(screen.getByText('Estado Inicial del Tablero')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Execute()' }));
    expect(screen.getByText('1. MoveCommand.Execute() — Avance Simple')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Execute()' }));
    expect(screen.getByText('2. MoveCommand.Execute() — Captura con Snapshot')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo()' }));
    expect(screen.getByText('3. MoveCommand.Undo() — Restauración de Captura')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '4 Niveles de DI' }));
    fireEvent.click(screen.getByRole('button', { name: /Nivel 4/i }));
    expect(screen.getByText('100% Testeable con Stub/Fake')).toBeInTheDocument();
  });

  it('WeightedVendorMatrixVisualizer computes weighted matrix and classifies Core vs Commodity', () => {
    renderWithTheme(<WeightedVendorMatrixVisualizer />, 'module-3-bpo-sla');

    expect(screen.getByText('6.90')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Core vs\. Commodity/i }));
    expect(screen.getByText('CORE DEL NEGOCIO')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Liquidación de Sueldos' }));
    expect(screen.getByText('COMMODITY')).toBeInTheDocument();
  });
});

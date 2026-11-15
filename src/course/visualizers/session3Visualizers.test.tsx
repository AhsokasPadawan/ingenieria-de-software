import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SECTION_THEMES, SectionThemeContext } from '../../core/domain/sectionThemes';
import { VISUALIZER_LOOKUP } from '../components/courseBlockRegistry';
import { COURSE_SLIDE_DECK } from '../data/courseModulesData';
import { HmacAuditChainVisualizer } from './HmacAuditChainVisualizer';
import { ObjectPoolAndMemoryVisualizer } from './ObjectPoolAndMemoryVisualizer';
import { RiskMatrixAndAdvisorVisualizer } from './RiskMatrixAndAdvisorVisualizer';

function renderWithTheme(ui: React.ReactElement, moduleId: string) {
  return render(
    <SectionThemeContext.Provider value={SECTION_THEMES[moduleId]}>
      {ui}
    </SectionThemeContext.Provider>,
  );
}

describe('Sesión 3 Visualizers', () => {
  it('links Unit 04, 05, and 06 concepts to visualizer slides and registry', () => {
    const visualizerIds = new Set(
      COURSE_SLIDE_DECK.filter((slide) => slide.slideKind === 'visualizer').map(
        (slide) => slide.visualizerId,
      ),
    );
    expect(visualizerIds.has('object-pool-memory')).toBe(true);
    expect(visualizerIds.has('risk-matrix-advisor')).toBe(true);
    expect(visualizerIds.has('hmac-audit-chain')).toBe(true);
    expect(typeof VISUALIZER_LOOKUP['object-pool-memory']).toBe('function');
    expect(typeof VISUALIZER_LOOKUP['risk-matrix-advisor']).toBe('function');
    expect(typeof VISUALIZER_LOOKUP['hmac-audit-chain']).toBe('function');
  });

  it('ObjectPoolAndMemoryVisualizer simulates Pool vs Heap/GC and EventEmitter Dispose leak', () => {
    renderWithTheme(<ObjectPoolAndMemoryVisualizer />, 'module-4-optimizacion');

    fireEvent.click(screen.getByRole('button', { name: /Get\(\) ×1/i }));
    expect(screen.getByText(/1 instancia\(s\) reutilizada\(s\) con 0 asignaciones nuevas en Heap/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Return\(\) todos/i }));
    expect(screen.getByText(/todas las instancias volvieron a estado disponible/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Sin Pool/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ráfaga ×5/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ráfaga ×5/i }));
    expect(screen.getByText(/el Garbage Collector pausó la ejecución/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Memory Leak & Dispose/i }));
    expect(screen.getByText('LeakySubscriber #1')).toBeInTheDocument();
    expect(screen.getByText('FixedSubscriber #2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Soltar referencia sin Dispose/i }));
    fireEvent.click(screen.getByRole('button', { name: /Llamar Dispose\(\) y soltar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ejecutar GC/i }));

    expect(screen.getByText('Memory Leak')).toBeInTheDocument();
    expect(screen.getByText('Liberado por GC')).toBeInTheDocument();
  });

  it('RiskMatrixAndAdvisorVisualizer updates risk matrix treatment and steps through AdvisedMoveSelector', () => {
    renderWithTheme(<RiskMatrixAndAdvisorVisualizer />, 'module-5-gobernanza');

    expect(screen.getByText('4 × 5 = 20')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Evitar' }));
    expect(screen.getByText('1 × 1 = 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Flujo AdvisedMoveSelector/i }));
    fireEvent.click(screen.getByRole('button', { name: /2\. Jugada ilegal/i }));
    expect(screen.getByText(/outcome: "respaldo:jugada-ilegal"/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByText('Paso 2 / 4')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Anterior/i }));
    expect(screen.getByText('Paso 1 / 4')).toBeInTheDocument();
  });

  it('HmacAuditChainVisualizer detects tampered fields, deleted intermediate rows, and tail truncation', async () => {
    renderWithTheme(<HmacAuditChainVisualizer />, 'module-6-auditoria');

    expect(screen.getByText('-1 (Cadena íntegra)')).toBeInTheDocument();

    const actorInputs = screen.getAllByLabelText(/actor \(editable/i);
    fireEvent.change(actorInputs[0], { target: { value: 'atacante' } });

    await waitFor(() => {
      expect(screen.getByText('Índice 0')).toBeInTheDocument();
    });
    expect(screen.getByText('authentic = false (MAC inválido)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Restaurar cadena/i }));
    expect(screen.getByText('-1 (Cadena íntegra)')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: 'Borrar' });
    fireEvent.click(deleteButtons[1]);
    expect(screen.getByText('Índice 2')).toBeInTheDocument();
    expect(screen.getByText('linked = false (prevMac roto)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Restaurar cadena/i }));
    const restoredDeleteButtons = screen.getAllByRole('button', { name: 'Borrar' });
    fireEvent.click(restoredDeleteButtons[3]);
    expect(screen.getByText('-1 (Cadena íntegra)')).toBeInTheDocument();
    expect(screen.getByText(/Límite 3 detectado:/i)).toBeInTheDocument();
  });
});

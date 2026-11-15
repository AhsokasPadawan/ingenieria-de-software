import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExamExerciseItem } from '../domain/coreTypes';
import { ExamPracticeView } from './practice/ExamPracticeView';

const SYNTHETIC_EXERCISES: readonly ExamExerciseItem[] = [
  {
    id: 'ex-1-optics',
    number: 1,
    title: 'Refracción en Lente Convergente',
    paradigm: 'Óptica Geométrica',
    difficultyLabel: 'Media',
    targetComplexityLatex: 'O(1)',
    sourceOrigin: 'Parcial',
    problemStatement: 'Calcular la distancia focal dada la curvatura del lente.',
    inputOutputExample: 'Entrada: R=10cm -> Salida: f=20cm',
    conceptualStrategy: {
      invariantAndIntuition: 'Aplicar la ecuación del fabricante de lentes.',
      keySteps: ['Determinar radios', 'Sustituir índice de refracción'],
      recurrenceOrTransitionLatex: '\\frac{1}{f} = (n - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)',
    },
  },
  {
    id: 'ex-2-waves',
    number: 2,
    title: 'Interferencia en Doble Rendija',
    paradigm: 'Ondas',
    difficultyLabel: 'Alta',
    targetComplexityLatex: 'O(n)',
    sourceOrigin: 'Diapositivas',
    problemStatement: 'Determinar la distancia entre máximos de interferencia.',
    inputOutputExample: 'Entrada: d=0.1mm -> Salida: y=5mm',
  },
];

beforeEach(() => {
  localStorage.clear();
});

describe('ExamPracticeView', () => {
  it('renders exercise statement, persists workspace drafts in localStorage, and switches to the whiteboard tab', async () => {
    const user = userEvent.setup();
    const onSelectExercise = vi.fn();
    const onToggleCompletedItem = vi.fn();
    const { unmount } = render(
      <ExamPracticeView
        exercises={SYNTHETIC_EXERCISES}
        completedItemIds={[]}
        selectedExerciseId="ex-1-optics"
        onSelectExercise={onSelectExercise}
        onToggleCompletedItem={onToggleCompletedItem}
      />,
    );

    const pseudocodeTextarea = screen.getByRole('textbox', {
      name: /Área de pseudocódigo para Refracción en Lente Convergente/i,
    });
    await user.type(pseudocodeTextarea, 'Funcion CalcularFoco(radio)');
    await user.click(screen.getByRole('tab', { name: /^Código$/i }));
    const codeTextarea = screen.getByRole('textbox', {
      name: /Área de código en csharp para Refracción en Lente Convergente/i,
    });
    await user.type(codeTextarea, 'double f = 20.0;');
    await user.click(screen.getByRole('tab', { name: /^Pizarrón$/i }));
    const toolbar = screen.getByRole('toolbar', { name: /Herramientas de dibujo/i });
    const rectangleButton = within(toolbar).getByRole('button', { name: /Rectángulo/i });
    await user.click(rectangleButton);

    expect(rectangleButton).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('img', {
        name: /Pizarrón para bocetar Refracción en Lente Convergente/i,
      }),
    ).toBeInTheDocument();

    unmount();
    render(
      <ExamPracticeView
        exercises={SYNTHETIC_EXERCISES}
        completedItemIds={[]}
        selectedExerciseId="ex-1-optics"
        onSelectExercise={onSelectExercise}
        onToggleCompletedItem={onToggleCompletedItem}
      />,
    );

    expect(
      screen.getByRole('textbox', {
        name: /Área de pseudocódigo para Refracción en Lente Convergente/i,
      }),
    ).toHaveValue('Funcion CalcularFoco(radio)');
  });

  it('omits example and algorithmic key blocks, switches practice tabs, and marks items as completed', async () => {
    const user = userEvent.setup();
    const onSelectExercise = vi.fn();
    const onSelectPracticeTab = vi.fn();
    const onToggleCompletedItem = vi.fn();
    render(
      <ExamPracticeView
        exercises={[SYNTHETIC_EXERCISES[0]]}
        completedItemIds={[]}
        selectedExerciseId="ex-1-optics"
        itemSingularLabel="Tarea"
        practiceTabs={[
          { id: 'tasks', label: 'Tareas', items: [SYNTHETIC_EXERCISES[0]], itemSingularLabel: 'Tarea' },
          { id: 'exercises', label: 'Ejercicios Prácticos', items: [SYNTHETIC_EXERCISES[1]], itemSingularLabel: 'Ejercicio' },
        ]}
        activePracticeTabId="tasks"
        onSelectExercise={onSelectExercise}
        onSelectPracticeTab={onSelectPracticeTab}
        onToggleCompletedItem={onToggleCompletedItem}
      />,
    );

    expect(screen.queryByText(/Ejemplo:/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Clave Algorítmica/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /Seleccionar ejercicio de práctica/i })).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /Marcar tarea Refracción en Lente Convergente como completada/i,
      }),
    );
    expect(onToggleCompletedItem).toHaveBeenCalledWith('ex-1-optics');

    await user.click(screen.getByRole('tab', { name: /Ejercicios Prácticos/i }));
    expect(onSelectPracticeTab).toHaveBeenCalledWith('exercises');
    expect(onSelectExercise).toHaveBeenCalledWith('ex-2-waves');
  });

  it('collapses and expands statement panel and restricts workspace tabs via resolveAllowedWorkspaceTabs', async () => {
    const user = userEvent.setup();
    render(
      <ExamPracticeView
        exercises={[SYNTHETIC_EXERCISES[0]]}
        completedItemIds={[]}
        selectedExerciseId="ex-1-optics"
        resolveAllowedWorkspaceTabs={() => ['text']}
        onSelectExercise={vi.fn()}
        onToggleCompletedItem={vi.fn()}
      />,
    );

    expect(screen.getByRole('tab', { name: /^Texto$/i })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^Código$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^Pizarrón$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^Pseudocódigo$/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: /Área de texto plano para Refracción en Lente Convergente/i,
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Colapsar consigna/i }));
    expect(screen.queryByText(/Consigna Formal/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Expandir consigna/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Expandir consigna/i }));
    expect(screen.getByText(/Consigna Formal/i)).toBeInTheDocument();
  });
});

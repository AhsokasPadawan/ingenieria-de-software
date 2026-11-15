import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AnimationPlayerShell } from './AnimationPlayerShell';

describe('AnimationPlayerShell', () => {
  it('renders title, step counter, description, and triggers playback, speed, step, and reset callbacks', async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    const onTogglePlay = vi.fn();
    const onSpeedChange = vi.fn();
    const onReset = vi.fn();

    render(
      <AnimationPlayerShell
        title="Simulador de Cola"
        badge="Demo"
        currentStep={1}
        totalSteps={4}
        isPlaying={false}
        playbackSpeed={1}
        stepDescription="Procesando elemento 2"
        onStepChange={onStepChange}
        onTogglePlay={onTogglePlay}
        onSpeedChange={onSpeedChange}
        onReset={onReset}
      >
        <div>Contenido del escenario</div>
      </AnimationPlayerShell>,
    );

    expect(screen.getByText('Demo')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Simulador de Cola' })).toBeInTheDocument();
    expect(screen.getByText('Paso 2 de 4')).toBeInTheDocument();
    expect(screen.getByText('Procesando elemento 2')).toBeInTheDocument();
    expect(screen.getByText('Contenido del escenario')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ir al inicio' }));
    expect(onStepChange).toHaveBeenCalledWith(0);

    await user.click(screen.getByRole('button', { name: 'Paso anterior' }));
    expect(onStepChange).toHaveBeenCalledWith(0);

    await user.click(screen.getByRole('button', { name: 'Paso siguiente' }));
    expect(onStepChange).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('button', { name: 'Reproducir' }));
    expect(onTogglePlay).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: '2x' }));
    expect(onSpeedChange).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('button', { name: 'Reiniciar visualizador' }));
    expect(onReset).toHaveBeenCalledTimes(1);

    const slider = screen.getByRole('slider', { name: /Control deslizante de pasos para Simulador de Cola/i });
    fireEvent.change(slider, { target: { value: '3' } });
    expect(onStepChange).toHaveBeenCalledWith(3);
  });
});

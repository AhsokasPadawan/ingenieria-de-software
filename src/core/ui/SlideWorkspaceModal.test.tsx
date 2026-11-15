import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SlideWorkspaceModal } from './slides/SlideWorkspaceModal';

describe('SlideWorkspaceModal', () => {
  it('renders modal workspace and closes on close button, backdrop click, or Escape key', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <SlideWorkspaceModal
        moduleId="module-1"
        moduleTitle="Arquitectura"
        onClose={onClose}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: /Workspace de Arquitectura/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Workspace · Arquitectura')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Cerrar workspace/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(2);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});

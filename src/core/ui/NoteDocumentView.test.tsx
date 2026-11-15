import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NoteDocumentView } from './notes/NoteDocumentView';

describe('NoteDocumentView', () => {
  it('renders note metadata, PDF object preview, counter, and download links', () => {
    render(
      <NoteDocumentView
        note={{
          id: 'note-1',
          order: 1,
          title: 'Unidad 01: Ingeniería y Diseño',
          fileName: '1. Unidad 01.pdf',
          url: '/apuntes/unidad-01.pdf',
        }}
        noteIndex={0}
        totalNotesCount={5}
      />,
    );

    expect(screen.getByRole('region', { name: /Apunte: Unidad 01: Ingeniería y Diseño/i })).toBeInTheDocument();
    expect(screen.getByText('PDF #1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Unidad 01: Ingeniería y Diseño/i })).toBeInTheDocument();
    expect(screen.getByText('/ 5')).toBeInTheDocument();

    const downloadLink = screen.getByRole('link', { name: /Descargar PDF Unidad 01: Ingeniería y Diseño/i });
    expect(downloadLink).toHaveAttribute('href', '/apuntes/unidad-01.pdf');
    expect(downloadLink).toHaveAttribute('download', '1. Unidad 01.pdf');
  });
});

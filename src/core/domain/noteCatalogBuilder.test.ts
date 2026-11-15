import { describe, expect, it } from 'vitest';
import { buildCourseNotesCatalog } from './noteCatalogBuilder';

describe('noteCatalogBuilder', () => {
  it('builds a sorted catalog of course notes stripping extensions and student suffixes', () => {
    const catalog = buildCourseNotesCatalog({
      '/apuntes/2. Unidad 01_ SOLID_Apuntes del Alumno.pdf': '/assets/u1-solid.pdf',
      '/apuntes/0. Unidad 00_ Repaso_Apuntes de Alumno.pdf': '/assets/u0-repaso.pdf',
      'C:\\apuntes\\10. Unidad 06_ Auditoria.pdf': '/assets/u6-auditoria.pdf',
      '/apuntes/Anexo sin numero.pdf': '/assets/anexo.pdf',
    });

    expect(catalog.map((item) => item.order)).toEqual([0, 2, 10, Number.MAX_SAFE_INTEGER]);
    expect(catalog[0]).toMatchObject({
      title: '0. Unidad 00: Repaso',
      fileName: '0. Unidad 00_ Repaso_Apuntes de Alumno.pdf',
      url: '/assets/u0-repaso.pdf',
    });
    expect(catalog[1]).toMatchObject({
      title: '2. Unidad 01: SOLID',
      fileName: '2. Unidad 01_ SOLID_Apuntes del Alumno.pdf',
      url: '/assets/u1-solid.pdf',
    });
    expect(catalog[2].title).toBe('10. Unidad 06: Auditoria');
    expect(catalog[3].id).toBe('note-anexo-sin-numero');
  });
});

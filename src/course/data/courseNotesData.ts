import { buildCourseNotesCatalog } from '../../core/domain/noteCatalogBuilder';

const rawApuntesPdfUrls = import.meta.glob<string>('../../../apuntes/*.pdf', {
  query: '?url',
  import: 'default',
  eager: true,
});

export const COURSE_NOTES_LIST = buildCourseNotesCatalog(rawApuntesPdfUrls);

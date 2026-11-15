import { CourseNoteDocument } from './coreTypes';

const PDF_EXTENSION_PATTERN = /\.pdf$/i;
const STUDENT_NOTES_SUFFIX_PATTERN = /_Apuntes del? Alumno$/i;
const UNDERSCORE_WITH_SPACES_PATTERN = /_\s*/g;
const LEADING_ORDER_PATTERN = /^(\d+)\.\s*/;

function extractFileNameFromPath(filePath: string): string {
  const segments = filePath.split(/[/\\]/);
  return segments[segments.length - 1] ?? filePath;
}

function extractNoteOrder(fileName: string): number {
  const match = LEADING_ORDER_PATTERN.exec(fileName);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function formatNoteDisplayTitle(fileName: string): string {
  const withoutExtension = fileName.replace(PDF_EXTENSION_PATTERN, '');
  const withoutSuffix = withoutExtension.replace(STUDENT_NOTES_SUFFIX_PATTERN, '');
  return withoutSuffix.replace(UNDERSCORE_WITH_SPACES_PATTERN, ': ').trim();
}

function buildNoteId(fileName: string, index: number): string {
  const slug = fileName
    .replace(PDF_EXTENSION_PATTERN, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug ? `note-${slug}` : `note-${index}`;
}

export function buildCourseNotesCatalog(
  globUrlMap: Record<string, string>,
): CourseNoteDocument[] {
  return Object.entries(globUrlMap)
    .map(([filePath, url], index) => {
      const fileName = extractFileNameFromPath(filePath);
      return {
        id: buildNoteId(fileName, index),
        order: extractNoteOrder(fileName),
        title: formatNoteDisplayTitle(fileName),
        fileName,
        url,
      };
    })
    .sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }
      return left.fileName.localeCompare(right.fileName, 'es', { numeric: true });
    });
}

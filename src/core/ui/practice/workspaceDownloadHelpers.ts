import { CodeTargetLanguage } from './WorkspaceHeaderBar';

export const CODE_LANGUAGE_EXTENSIONS: Record<CodeTargetLanguage, string> = {
  csharp: 'cs',
  java: 'java',
  python: 'py',
};

export function sanitizeDownloadFileName(rawName: string): string {
  const normalized = rawName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'archivo';
}

export function formatCurrentIsoDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildPracticeWorkspaceDownloadBaseName(
  exerciseId: string,
  exerciseTitle: string,
): string {
  return sanitizeDownloadFileName(`${exerciseId}-${exerciseTitle}`);
}

export function buildSlideWorkspaceDownloadBaseName(
  moduleTitle: string,
  date: Date = new Date(),
): string {
  return `${sanitizeDownloadFileName(moduleTitle)}-${formatCurrentIsoDate(date)}`;
}

function triggerAnchorDownload(href: string, fileName: string): void {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
}

export function triggerDataUrlDownload(dataUrl: string, fileName: string): void {
  triggerAnchorDownload(dataUrl, fileName);
}

export function triggerTextFileDownload(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  triggerAnchorDownload(objectUrl, fileName);
  URL.revokeObjectURL(objectUrl);
}

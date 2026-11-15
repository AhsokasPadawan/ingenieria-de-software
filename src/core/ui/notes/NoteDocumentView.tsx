import { Download, FileText } from 'lucide-react';
import { CourseNoteDocument } from '../../domain/coreTypes';
import { DEFAULT_SECTION_THEME } from '../../domain/sectionThemes';

export interface NoteDocumentViewProps {
  note: CourseNoteDocument;
  noteIndex: number;
  totalNotesCount: number;
}

export function NoteDocumentView({
  note,
  noteIndex,
  totalNotesCount,
}: NoteDocumentViewProps) {
  const sectionTheme = DEFAULT_SECTION_THEME;

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={`Apunte: ${note.title}`}
      className="flex h-full w-full flex-col justify-between bg-white p-2.5 sm:p-3 md:p-3.5 transition-all outline-none dark:bg-zinc-900 overflow-y-auto md:overflow-hidden"
    >
      <div
        className={`shrink-0 border-b pb-2.5 ${sectionTheme.cardBorderClass} flex flex-wrap items-center justify-between gap-3`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${sectionTheme.slideBadgeClass}`}
            >
              PDF #{noteIndex + 1}
            </span>
            <h1
              className={`text-xs sm:text-sm font-black uppercase tracking-wider truncate ${sectionTheme.slideHeaderClass}`}
            >
              Apuntes para descargar
            </h1>
          </div>
          <h2
            className={`text-lg sm:text-xl md:text-2xl font-black truncate mt-0.5 ${sectionTheme.titleTextClass}`}
          >
            {note.title}
          </h2>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <a
            href={note.url}
            download={note.fileName}
            aria-label={`Descargar PDF ${note.title}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-500 active:scale-95 dark:border-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Download className="h-4 w-4" />
            <span>Descargar PDF</span>
          </a>

          <div
            className={`hidden sm:block rounded-xl border px-3.5 py-1 text-center ${sectionTheme.counterBoxClass}`}
          >
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider leading-none opacity-80">
              Apunte
            </div>
            <div className="font-mono text-sm sm:text-base md:text-lg font-black leading-tight">
              {noteIndex + 1}{' '}
              <span className="text-xs font-normal opacity-60">/ {totalNotesCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="my-2 flex-1 min-h-[70vh] md:min-h-0 flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <object
          data={note.url}
          type="application/pdf"
          aria-label={note.title}
          className="h-full w-full flex-1"
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
            <FileText className="h-10 w-10 text-zinc-400 dark:text-zinc-500" />
            <p className="max-w-md text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tu navegador no pudo mostrar el PDF integrado en esta vista.
            </p>
            <a
              href={note.url}
              download={note.fileName}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-500 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Descargar {note.fileName}</span>
            </a>
          </div>
        </object>
      </div>
    </div>
  );
}

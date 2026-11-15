import { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { CourseNoteDocument } from '../../domain/coreTypes';

export interface SidebarNotesSectionProps {
  notes: readonly CourseNoteDocument[];
  activeNoteId?: string | null;
  onSelectNote: (noteId: string) => void;
}

export function SidebarNotesSection({
  notes,
  activeNoteId,
  onSelectNote,
}: SidebarNotesSectionProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex w-full items-center justify-between px-2 pb-1.5 text-[10px] font-bold tracking-wider text-emerald-700 uppercase transition hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
      >
        <span>Apuntes para descargar</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <nav className="space-y-1" aria-label="Apuntes para descargar">
          {notes.map((note) => {
            const isActive = note.id === activeNoteId;
            return (
              <button
                key={note.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelectNote(note.id)}
                title={note.title}
                className={`flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition ${
                  isActive
                    ? 'bg-white text-emerald-900 border border-emerald-300 font-bold shadow-xs dark:bg-emerald-500/20 dark:text-emerald-100 dark:border-emerald-400/50'
                    : 'text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white'
                }`}
              >
                <FileText
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-300'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                />
                <span className="leading-snug">{note.title}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

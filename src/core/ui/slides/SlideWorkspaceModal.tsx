import { useEffect } from 'react';
import { Terminal, X } from 'lucide-react';
import { ModuleId } from '../../domain/coreTypes';
import { ExerciseWorkspace, WorkspaceCodeTokenizer } from '../practice/ExerciseWorkspace';
import { buildSlideWorkspaceDownloadBaseName } from '../practice/workspaceDownloadHelpers';

export interface SlideWorkspaceModalProps {
  moduleId: ModuleId;
  moduleTitle: string;
  tokenizeCode?: WorkspaceCodeTokenizer;
  onClose: () => void;
}

export function SlideWorkspaceModal({
  moduleId,
  moduleTitle,
  tokenizeCode,
  onClose,
}: SlideWorkspaceModalProps) {
  const workspaceStorageId = `slide-module-${moduleId}`;
  const downloadFileBaseName = buildSlideWorkspaceDownloadBaseName(moduleTitle);

  useEffect(() => {
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Workspace de ${moduleTitle}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs animate-fade-slide-in"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex h-[90vh] w-[96vw] max-w-7xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Terminal className="h-4 w-4 shrink-0 text-fuchsia-400" />
            <span className="truncate text-sm font-bold text-zinc-100">
              Workspace · {moduleTitle}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar workspace"
            title="Cerrar workspace (Esc)"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-2 sm:p-3">
          <ExerciseWorkspace
            key={workspaceStorageId}
            exerciseId={workspaceStorageId}
            exerciseTitle={moduleTitle}
            downloadFileBaseName={downloadFileBaseName}
            tokenizeCode={tokenizeCode}
          />
        </div>
      </div>
    </div>
  );
}

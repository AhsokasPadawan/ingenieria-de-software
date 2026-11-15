import { ReactNode, useState } from 'react';
import { CodeLanguage } from '../../domain/coreTypes';
import {
  ExerciseUserDraft,
  loadExerciseUserDraft,
  saveExerciseUserDraft,
} from '../../domain/studyPreferencesStorage';
import { ExerciseWhiteboard } from './ExerciseWhiteboard';
import { WorkspaceCodeEditor } from './WorkspaceCodeEditor';
import {
  buildPracticeWorkspaceDownloadBaseName,
  CODE_LANGUAGE_EXTENSIONS,
  triggerTextFileDownload,
} from './workspaceDownloadHelpers';
import {
  CodeTargetLanguage,
  WorkspaceHeaderBar,
  WorkspaceTab,
} from './WorkspaceHeaderBar';

export interface WorkspaceCodeToken {
  text: string;
  colorClass: string;
}

export type WorkspaceCodeTokenizer = (
  sourceCode: string,
  language: CodeLanguage,
) => WorkspaceCodeToken[];

export interface ExerciseWorkspaceProps {
  exerciseId: string;
  exerciseTitle: string;
  allowedTabs?: readonly WorkspaceTab[];
  downloadFileBaseName?: string;
  tokenizeCode?: WorkspaceCodeTokenizer;
}

type DraftTextField = keyof ExerciseUserDraft;

const CODE_LANGUAGE_DISPLAY_NAMES: Record<CodeTargetLanguage, string> = {
  csharp: 'C#',
  java: 'Java',
  python: 'Python',
};

const defaultCodeTokenizer: WorkspaceCodeTokenizer = (sourceCode) =>
  sourceCode ? [{ text: sourceCode, colorClass: 'text-zinc-100' }] : [];

function detectCodeLanguage(
  code: string,
  currentLanguage: CodeTargetLanguage,
): CodeTargetLanguage {
  if (
    /\b(def|elif|lambda|None|True|False)\b/.test(code) &&
    !/\b(public|static|void|class|namespace)\b/.test(code)
  ) {
    return 'python';
  }
  if (
    /\b(namespace|using\s+System|Console\.WriteLine|readonly|override|decimal|IEnumerable)\b/.test(
      code,
    )
  ) {
    return 'csharp';
  }
  if (/\b(System\.out|implements|extends|throws|import\s+java)\b/.test(code)) {
    return 'java';
  }
  return currentLanguage;
}

export function ExerciseWorkspace({
  exerciseId,
  exerciseTitle,
  allowedTabs,
  downloadFileBaseName,
  tokenizeCode = defaultCodeTokenizer,
}: ExerciseWorkspaceProps) {
  const defaultTab: WorkspaceTab = allowedTabs?.[0] ?? 'pseudocode';
  const [selectedTab, setSelectedTab] = useState<WorkspaceTab>(defaultTab);
  const activeTab: WorkspaceTab =
    allowedTabs && !allowedTabs.includes(selectedTab) ? defaultTab : selectedTab;
  const [codeLanguage, setCodeLanguage] = useState<CodeTargetLanguage>('csharp');
  const [draft, setDraft] = useState(() => loadExerciseUserDraft(exerciseId));
  const [copiedStatus, setCopiedStatus] = useState(false);

  const persistDraftField = (field: DraftTextField, value: string) => {
    const nextDraft = { ...draft, [field]: value };
    setDraft(nextDraft);
    saveExerciseUserDraft(exerciseId, nextDraft);
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextCode = event.target.value;
    const nextLanguage = detectCodeLanguage(nextCode, codeLanguage);
    if (nextLanguage !== codeLanguage) setCodeLanguage(nextLanguage);
    persistDraftField('code', nextCode);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab' || activeTab === 'whiteboard') return;
    event.preventDefault();
    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = `${textarea.value.substring(0, start)}    ${textarea.value.substring(end)}`;
    persistDraftField(activeTab, nextValue);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 4;
    }, 0);
  };

  const currentContent = activeTab === 'whiteboard' ? '' : draft[activeTab];

  const resolvedDownloadBaseName =
    downloadFileBaseName ?? buildPracticeWorkspaceDownloadBaseName(exerciseId, exerciseTitle);

  const handleCopyCurrentDraft = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(currentContent);
      } catch {
        setCopiedStatus(true);
      }
    }
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 1800);
  };

  const handleDownloadCurrentDraft = () => {
    if (activeTab === 'whiteboard') return;
    const extensionByTab: Record<Exclude<WorkspaceTab, 'whiteboard'>, string> = {
      pseudocode: 'txt',
      text: 'txt',
      code: CODE_LANGUAGE_EXTENSIONS[codeLanguage],
    };
    triggerTextFileDownload(
      currentContent,
      `${resolvedDownloadBaseName}.${extensionByTab[activeTab]}`,
    );
  };

  const headerLanguageByTab: Record<WorkspaceTab, CodeLanguage | 'texto'> = {
    pseudocode: 'pseudocode',
    code: codeLanguage,
    text: 'texto',
    whiteboard: 'pseudocode',
  };

  const workspaceBodyByTab: Record<WorkspaceTab, () => ReactNode> = {
    pseudocode: () => (
      <WorkspaceCodeEditor
        value={draft.pseudocode}
        language="pseudocode"
        tokenizeCode={tokenizeCode}
        placeholder={`Escribe aquí tu pseudocódigo para "${exerciseTitle}"...`}
        ariaLabel={`Área de pseudocódigo para ${exerciseTitle}`}
        onChange={(event) => persistDraftField('pseudocode', event.target.value)}
        onKeyDown={handleKeyDown}
      />
    ),
    code: () => (
      <WorkspaceCodeEditor
        value={draft.code}
        language={codeLanguage}
        tokenizeCode={tokenizeCode}
        placeholder={`Escribe aquí tu código en ${CODE_LANGUAGE_DISPLAY_NAMES[codeLanguage]} para "${exerciseTitle}"...`}
        ariaLabel={`Área de código en ${codeLanguage} para ${exerciseTitle}`}
        onChange={handleCodeChange}
        onKeyDown={handleKeyDown}
      />
    ),
    text: () => (
      <div className="flex flex-1 min-h-0 overflow-hidden bg-zinc-950">
        <textarea
          value={draft.text}
          onKeyDown={handleKeyDown}
          onChange={(event) => persistDraftField('text', event.target.value)}
          placeholder={`Escribe aquí tus notas o desarrollo en texto plano para "${exerciseTitle}"...`}
          aria-label={`Área de texto plano para ${exerciseTitle}`}
          className="h-full w-full resize-none overflow-auto bg-transparent p-4 text-sm leading-6 text-zinc-100 caret-fuchsia-400 placeholder-zinc-600 outline-none whitespace-pre-wrap selection:bg-fuchsia-500/30"
        />
      </div>
    ),
    whiteboard: () => (
      <ExerciseWhiteboard
        exerciseId={exerciseId}
        exerciseTitle={exerciseTitle}
        downloadFileBaseName={resolvedDownloadBaseName}
      />
    ),
  };

  return (
    <div className="flex h-full min-h-[320px] flex-1 flex-col overflow-hidden rounded-2xl border border-fuchsia-900/50 bg-zinc-950 text-zinc-100 shadow-md">
      <WorkspaceHeaderBar
        activeTab={activeTab}
        allowedTabs={allowedTabs}
        codeLanguage={codeLanguage}
        currentLanguage={headerLanguageByTab[activeTab]}
        hasContent={Boolean(currentContent)}
        copiedStatus={copiedStatus}
        onSelectTab={setSelectedTab}
        onSelectCodeLanguage={setCodeLanguage}
        onCopyDraft={handleCopyCurrentDraft}
        onDownloadDraft={handleDownloadCurrentDraft}
        onClearDraft={() => {
          if (activeTab !== 'whiteboard') {
            persistDraftField(activeTab, '');
          }
        }}
      />

      {workspaceBodyByTab[activeTab]()}
    </div>
  );
}

import { useRef } from 'react';
import { CodeLanguage } from '../../domain/coreTypes';
import { WorkspaceCodeTokenizer } from './ExerciseWorkspace';

export interface WorkspaceCodeEditorProps {
  value: string;
  language: CodeLanguage;
  tokenizeCode: WorkspaceCodeTokenizer;
  placeholder: string;
  ariaLabel: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function WorkspaceCodeEditor({
  value,
  language,
  tokenizeCode,
  placeholder,
  ariaLabel,
  onChange,
  onKeyDown,
}: WorkspaceCodeEditorProps) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = event.currentTarget;
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
  };

  const tokens = tokenizeCode(value, language);
  const totalLineNumbers = Math.max(value.split('\n').length + 10, 30);

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden bg-zinc-950">
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="w-12 shrink-0 select-none overflow-hidden border-r border-zinc-800/80 bg-zinc-900/50 py-3 pr-2.5 text-right font-mono text-xs leading-6 text-zinc-500"
      >
        {Array.from({ length: totalLineNumbers }, (_, index) => (
          <div key={index} className="leading-6">
            {index + 1}
          </div>
        ))}
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden font-mono text-xs leading-6 sm:text-sm">
        <pre
          ref={preRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-0 overflow-hidden p-3 font-mono text-xs leading-6 whitespace-pre sm:text-sm"
        >
          <code>
            {tokens.map((token, index) => (
              <span key={index} className={token.colorClass}>
                {token.text}
              </span>
            ))}
            {value.endsWith('\n') ? '\u00A0' : null}
          </code>
        </pre>

        <textarea
          value={value}
          onScroll={handleScroll}
          onKeyDown={onKeyDown}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="absolute inset-0 m-0 h-full w-full resize-none overflow-auto bg-transparent p-3 font-mono text-xs leading-6 text-transparent caret-fuchsia-400 placeholder-zinc-600 outline-none whitespace-pre selection:bg-fuchsia-500/30 sm:text-sm"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

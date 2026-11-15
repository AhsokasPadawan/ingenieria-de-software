import { ReactNode } from 'react';
import { useSectionTheme } from '../../../core/domain/sectionThemes';

export interface InteractiveVisualizerShellProps {
  title: string;
  badge?: string;
  headerActions?: ReactNode;
  footerBanner?: ReactNode;
  children: ReactNode;
}

export function InteractiveVisualizerShell({
  title,
  badge,
  headerActions,
  footerBanner,
  children,
}: InteractiveVisualizerShellProps) {
  const sectionTheme = useSectionTheme();

  return (
    <div
      className={`h-full min-h-full flex-1 flex flex-col justify-between rounded-2xl border p-3.5 sm:p-4 md:p-5 ${sectionTheme.analysisPanelClass}`}
    >
      <div
        className={`shrink-0 flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 ${sectionTheme.analysisDividerClass}`}
      >
        <div className="flex items-center gap-2">
          {badge && (
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${sectionTheme.slideBadgeClass}`}
            >
              {badge}
            </span>
          )}
          <h3
            className={`text-sm font-bold tracking-wide sm:text-base ${sectionTheme.titleTextClass}`}
          >
            {title}
          </h3>
        </div>

        {headerActions && <div className="flex flex-wrap items-center gap-2">{headerActions}</div>}
      </div>

      <div
        className={`flex-1 min-h-0 my-2.5 rounded-xl border-2 bg-zinc-950 p-3 sm:p-4 flex flex-col justify-between overflow-y-auto text-zinc-100 ${sectionTheme.cardBorderClass}`}
      >
        {children}
      </div>

      {footerBanner && (
        <div
          className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-medium ${sectionTheme.accentSurfaceClass} ${sectionTheme.strongTextClass}`}
        >
          {footerBanner}
        </div>
      )}
    </div>
  );
}

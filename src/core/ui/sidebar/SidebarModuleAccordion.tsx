import { useState } from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import {
  ExamParadigmCategory,
  ModuleId,
  ModuleMetadata,
  ModuleSubtopicItem,
} from '../../domain/coreTypes';
import { SECTION_THEMES } from '../../domain/sectionThemes';
import { PracticeTabItem } from '../practice/ExamPracticeView';

export interface SidebarModuleAccordionProps {
  moduleItem: ModuleMetadata;
  subtopics: readonly ModuleSubtopicItem[];
  isActive: boolean;
  isCompleted: boolean;
  isOpen: boolean;
  isPracticeModule: boolean;
  activeSlideId?: string;
  activeSubtopicId?: string;
  activeExerciseParadigm?: ExamParadigmCategory;
  practiceTabs?: readonly PracticeTabItem[];
  activePracticeTabId?: string;
  selectedPracticeExerciseId?: string;
  completedItemIds?: readonly string[];
  onToggleAccordion: (moduleId: ModuleId) => void;
  onSelectSubtopic: (moduleId: ModuleId, subtopic: ModuleSubtopicItem) => void;
  onSelectPracticeItem?: (tabId: string, exerciseId: string) => void;
}

export function SidebarModuleAccordion({
  moduleItem,
  subtopics,
  isActive,
  isCompleted,
  isOpen,
  isPracticeModule,
  activeSlideId,
  activeSubtopicId,
  activeExerciseParadigm,
  practiceTabs,
  activePracticeTabId,
  selectedPracticeExerciseId,
  completedItemIds = [],
  onToggleAccordion,
  onSelectSubtopic,
  onSelectPracticeItem,
}: SidebarModuleAccordionProps) {
  const theme = SECTION_THEMES[moduleItem.id];
  const [prevPracticeTabId, setPrevPracticeTabId] = useState<string | undefined>(activePracticeTabId);
  const [openPracticeTabId, setOpenPracticeTabId] = useState<string | null>(
    activePracticeTabId ?? practiceTabs?.[0]?.id ?? null,
  );

  if (prevPracticeTabId !== activePracticeTabId) {
    setPrevPracticeTabId(activePracticeTabId);
    if (activePracticeTabId) {
      setOpenPracticeTabId(activePracticeTabId);
    }
  }

  const hasPracticeTabs = Boolean(isPracticeModule && practiceTabs && practiceTabs.length > 0);
  const hasExpandableContent = hasPracticeTabs || subtopics.length > 0;

  const handlePracticeGroupClick = (tab: PracticeTabItem) => {
    const isAlreadyOpen = openPracticeTabId === tab.id;
    if (tab.id !== activePracticeTabId) {
      setOpenPracticeTabId(tab.id);
      if (tab.items.length > 0) {
        onSelectPracticeItem?.(tab.id, tab.items[0].id);
      }
      return;
    }
    setOpenPracticeTabId(isAlreadyOpen ? null : tab.id);
  };

  return (
    <div className="rounded-xl overflow-hidden transition-colors">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-current={isActive ? 'page' : undefined}
        aria-label={moduleItem.sidebarTitle}
        onClick={() => onToggleAccordion(moduleItem.id)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
          isActive
            ? theme.sidebarActiveClass
            : 'text-zinc-700 hover:bg-zinc-200/70 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${theme.dotClass}`}
          />
          <span className="truncate">{moduleItem.sidebarTitle}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isCompleted && (
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full bg-amber-400"
            />
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && hasExpandableContent && (
        <div
          className={`mt-1 ml-3.5 pl-2.5 border-l-2 ${theme.sidebarAccordionBorderClass} flex flex-col gap-0.5 py-1`}
        >
          {hasPracticeTabs && practiceTabs
            ? practiceTabs.map((tab) => {
                const isGroupOpen = openPracticeTabId === tab.id;
                const isGroupActive = isActive && activePracticeTabId === tab.id;
                return (
                  <div key={tab.id} className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      aria-expanded={isGroupOpen}
                      onClick={() => handlePracticeGroupClick(tab)}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] font-semibold transition ${
                        isGroupActive
                          ? theme.subtopicActiveClass
                          : theme.subtopicHoverClass
                      }`}
                    >
                      <span className="truncate">{tab.label}</span>
                      <ChevronDown
                        className={`h-3 w-3 shrink-0 transition-transform duration-200 ${
                          isGroupOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isGroupOpen && tab.items.length > 0 && (
                      <div
                        className={`ml-2 pl-2 border-l ${theme.sidebarAccordionBorderClass} flex flex-col gap-0.5 py-0.5`}
                      >
                        {tab.items.map((item) => {
                          const isItemActive =
                            isActive &&
                            activePracticeTabId === tab.id &&
                            selectedPracticeExerciseId === item.id;
                          const isItemCompleted = completedItemIds.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              title={item.title}
                              aria-current={isItemActive ? 'page' : undefined}
                              onClick={() => onSelectPracticeItem?.(tab.id, item.id)}
                              className={`flex w-full items-center justify-between gap-1.5 rounded-lg px-2 py-1 text-left text-[11px] transition ${
                                isItemActive
                                  ? theme.subtopicActiveClass
                                  : theme.subtopicHoverClass
                              }`}
                            >
                              <span className="truncate">
                                #{item.number} · {item.title}
                              </span>
                              {isItemCompleted && (
                                <CheckCircle2
                                  aria-label="Completado"
                                  className="h-3 w-3 shrink-0 text-emerald-500 dark:text-emerald-400"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            : subtopics.map((subtopic) => {
                const isSubtopicActive = activeSubtopicId
                  ? subtopic.id === activeSubtopicId
                  : isPracticeModule
                    ? activeExerciseParadigm === subtopic.paradigm
                    : subtopic.slideId === activeSlideId;

                return (
                  <button
                    key={subtopic.id}
                    type="button"
                    onClick={() => onSelectSubtopic(moduleItem.id, subtopic)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] transition ${
                      isSubtopicActive
                        ? theme.subtopicActiveClass
                        : theme.subtopicHoverClass
                    }`}
                  >
                    <span className="truncate">{subtopic.title}</span>
                  </button>
                );
              })}
        </div>
      )}
    </div>
  );
}

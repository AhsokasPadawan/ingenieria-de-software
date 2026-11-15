import { ReactNode, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronDown, Menu, Moon, Search, Sun } from 'lucide-react';
import {
  ConceptSlide,
  CourseNoteDocument,
  ExamExerciseItem,
  ExamExerciseVisualResource,
  ExamParadigmCategory,
  ModuleId,
  ModuleMetadata,
  ModuleSubtopicItem,
  ThemeMode,
} from '../domain/coreTypes';
import { SECTION_THEMES } from '../domain/sectionThemes';
import {
  loadCompletedItemIds,
  loadSidebarCollapsedPreference,
  loadThemeMode,
  saveCompletedItemIds,
  saveSidebarCollapsedPreference,
  saveThemeMode,
} from '../domain/studyPreferencesStorage';
import { SearchableStudyEntry } from '../domain/studySearch';
import { GlobalSearchBar } from './GlobalSearchBar';
import { ExamPracticeView, PracticeTabItem } from './practice/ExamPracticeView';
import { WorkspaceCodeTokenizer } from './practice/ExerciseWorkspace';
import { PracticeFilterOption } from './practice/PracticeFilterBar';
import { WorkspaceTab } from './practice/WorkspaceHeaderBar';
import {
  calculateStudyProgressPercentage,
  findFirstModuleSlideIndex,
  findMatchingPracticeExercise,
  resolveSearchSelectionTarget,
} from './shellNavigationHelpers';
import { StudySidebar } from './sidebar/StudySidebar';
import { NoteDocumentView } from './notes/NoteDocumentView';
import { PresentationSlideView } from './slides/PresentationSlideView';
import { SlideWorkspaceModal } from './slides/SlideWorkspaceModal';
import { SlideBlockRegistry } from './slides/defaultBlockRegistry';

export interface StudyPlatformShellProps {
  courseTitle?: string;
  courseDepartment?: string;
  modules: readonly ModuleMetadata[];
  subtopicsByModuleId?: Record<ModuleId, readonly ModuleSubtopicItem[]>;
  notes?: readonly CourseNoteDocument[];
  slides: readonly ConceptSlide[];
  exercises?: readonly ExamExerciseItem[];
  searchIndex: readonly SearchableStudyEntry[];
  trackableItemIds: readonly string[];
  practiceModuleId?: ModuleId;
  practiceHeadingTitle?: string;
  paradigmFilters?: readonly PracticeFilterOption[];
  originFilters?: readonly PracticeFilterOption[];
  practiceTabs?: readonly PracticeTabItem[];
  courseBlockRegistry?: SlideBlockRegistry;
  resolveActiveSubtopicId?: (
    moduleId: ModuleId,
    moduleSlideIds: string[],
    activeSlideId: string,
    activeExerciseParadigm?: string,
  ) => string | undefined;
  matchesPracticeCategory?: (
    exercise: ExamExerciseItem,
    selectedCategory: ExamParadigmCategory,
  ) => boolean;
  renderExerciseVisualResource?: (
    resource: ExamExerciseVisualResource | null | undefined,
    exerciseId: string,
  ) => ReactNode;
  resolveAllowedWorkspaceTabs?: (
    exercise: ExamExerciseItem,
    practiceTabId?: string,
  ) => readonly WorkspaceTab[];
  tokenizeCode?: WorkspaceCodeTokenizer;
}

function subscribeViewport(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getIsMobileSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

function getServerSnapshot(): boolean {
  return false;
}

export function StudyPlatformShell({
  courseTitle,
  courseDepartment,
  modules,
  subtopicsByModuleId = {},
  notes = [],
  slides,
  exercises = [],
  searchIndex,
  trackableItemIds,
  practiceModuleId,
  practiceHeadingTitle,
  paradigmFilters,
  originFilters,
  practiceTabs,
  courseBlockRegistry,
  resolveActiveSubtopicId,
  matchesPracticeCategory,
  renderExerciseVisualResource,
  resolveAllowedWorkspaceTabs,
  tokenizeCode,
}: StudyPlatformShellProps) {
  const mainScrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useSyncExternalStore(subscribeViewport, getIsMobileSnapshot, getServerSnapshot);
  const initialModuleId = modules[0]?.id ?? slides[0]?.moduleId ?? 'module-0';
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>(initialModuleId);
  const [completedItemIds, setCompletedItemIds] = useState<string[]>(loadCompletedItemIds);
  const [themeMode, setThemeMode] = useState<ThemeMode>(loadThemeMode);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [activePracticeTabId, setActivePracticeTabId] = useState<string>(practiceTabs?.[0]?.id ?? 'default');
  const activePracticeTab = practiceTabs?.find((tab) => tab.id === activePracticeTabId) ?? practiceTabs?.[0];
  const activePracticeItems = activePracticeTab?.items ?? exercises;
  const allPracticeItems = practiceTabs ? practiceTabs.flatMap((tab) => tab.items) : exercises;
  const [selectedPracticeExerciseId, setSelectedPracticeExerciseId] = useState<string>(activePracticeItems[0]?.id ?? '');
  const [selectedPracticeParadigm, setSelectedPracticeParadigm] = useState<ExamParadigmCategory>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(loadSidebarCollapsedPreference);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [slideWorkspaceTarget, setSlideWorkspaceTarget] = useState<{
    moduleId: ModuleId;
    moduleTitle: string;
  } | null>(null);

  const currentSlide = slides[currentSlideIndex] ?? slides[0];
  const activeNote = activeNoteId ? notes.find((note) => note.id === activeNoteId) : undefined;
  const activeNoteIndex = activeNote ? notes.findIndex((note) => note.id === activeNote.id) : -1;
  const isExamPracticeActive = Boolean(!activeNote && practiceModuleId && activeModuleId === practiceModuleId && allPracticeItems.length > 0);

  const openSlideWorkspace = (slide: ConceptSlide) => {
    setSlideWorkspaceTarget({
      moduleId: slide.moduleId,
      moduleTitle: slide.moduleTitle,
    });
  };

  const resetMainScrollPosition = () => {
    if (mainScrollContainerRef.current) mainScrollContainerRef.current.scrollTop = 0;
    window.scrollTo?.({ top: 0 });
  };

  const handleNavigateSlide = (targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < slides.length) {
      setCurrentSlideIndex(targetIndex);
      if (slides[targetIndex].moduleId !== activeModuleId) setActiveModuleId(slides[targetIndex].moduleId);
    }
  };

  const slideKeyActions: Record<string, () => void> = {
    ArrowRight: () => handleNavigateSlide(currentSlideIndex + 1),
    ArrowLeft: () => handleNavigateSlide(currentSlideIndex - 1),
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = themeMode === 'emerald-night' ? 'emerald-light' : 'emerald-night';
    setThemeMode(nextTheme);
    saveThemeMode(nextTheme);
  };

  const handleToggleCollapse = () => {
    const nextCollapsed = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextCollapsed);
    saveSidebarCollapsedPreference(nextCollapsed);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      setIsSearchModalOpen((previous) => !previous);
      return;
    }
    if (isSearchModalOpen) {
      if (event.key === 'Escape') setIsSearchModalOpen(false);
      return;
    }
    if (isMobileDrawerOpen) {
      if (event.key === 'Escape') setIsMobileDrawerOpen(false);
      return;
    }
    if (slideWorkspaceTarget) {
      if (event.key === 'Escape') setSlideWorkspaceTarget(null);
      return;
    }
    if (activeNote) return;
    const keyAction = slideKeyActions[event.key];
    if (keyAction) {
      event.preventDefault();
      keyAction();
    }
  };

  const handleSelectNote = (noteId: string) => {
    setActiveNoteId(noteId);
    resetMainScrollPosition();
    setIsMobileDrawerOpen(false);
  };

  const handleSelectModule = (moduleId: ModuleId) => {
    setActiveNoteId(null);
    setActiveModuleId(moduleId);
    if (moduleId !== practiceModuleId) {
      const firstIndex = findFirstModuleSlideIndex(slides, moduleId);
      if (firstIndex !== -1) setCurrentSlideIndex(firstIndex);
    }
    resetMainScrollPosition();
    setIsMobileDrawerOpen(false);
    if (isMobile) {
      setTimeout(() => {
        if (mainScrollContainerRef.current) {
          mainScrollContainerRef.current.scrollTop = 0;
        }
        const firstModuleSlide = slides.find((slide) => slide.moduleId === moduleId);
        if (firstModuleSlide) {
          document.getElementById(`slide-${firstModuleSlide.id}`)?.scrollIntoView({ behavior: 'instant' });
        }
      }, 0);
    }
  };

  const handleSelectSubtopic = (moduleId: ModuleId, slideId?: string, paradigm?: ExamParadigmCategory) => {
    setActiveNoteId(null);
    setActiveModuleId(moduleId);
    if (moduleId === practiceModuleId && paradigm) {
      if (practiceTabs && practiceTabs.some((tab) => tab.id === paradigm)) {
        const targetTab = practiceTabs.find((tab) => tab.id === paradigm);
        setActivePracticeTabId(paradigm);
        setSelectedPracticeParadigm('all');
        if (targetTab && targetTab.items.length > 0) {
          setSelectedPracticeExerciseId(targetTab.items[0].id);
        }
      } else {
        setSelectedPracticeParadigm(paradigm);
        const match = findMatchingPracticeExercise(activePracticeItems, paradigm, matchesPracticeCategory)
          ?? findMatchingPracticeExercise(allPracticeItems, paradigm, matchesPracticeCategory);
        if (match) {
          const ownerTab = practiceTabs?.find((tab) => tab.items.some((item) => item.id === match.id));
          if (ownerTab) setActivePracticeTabId(ownerTab.id);
          setSelectedPracticeExerciseId(match.id);
        }
      }
    } else if (slideId) {
      const targetIndex = slides.findIndex((slide) => slide.id === slideId);
      if (targetIndex !== -1) setCurrentSlideIndex(targetIndex);
      if (isMobile) {
        setTimeout(() => {
          document.getElementById(`slide-${slideId}`)?.scrollIntoView({ behavior: 'smooth' });
        }, 30);
      }
    }
    if (!isMobile) resetMainScrollPosition();
    setIsMobileDrawerOpen(false);
  };

  const handleSelectPracticeItem = (tabId: string, exerciseId: string) => {
    setActiveNoteId(null);
    if (practiceModuleId) {
      setActiveModuleId(practiceModuleId);
    }
    setActivePracticeTabId(tabId);
    setSelectedPracticeParadigm('all');
    setSelectedPracticeExerciseId(exerciseId);
    resetMainScrollPosition();
    setIsMobileDrawerOpen(false);
  };

  const handleSelectSearchEntry = (entry: SearchableStudyEntry) => {
    setIsSearchModalOpen(false);
    setIsMobileDrawerOpen(false);
    setActiveNoteId(null);
    setActiveModuleId(entry.moduleId);
    const { targetSlideIndex, targetExerciseId } = resolveSearchSelectionTarget(entry, slides, allPracticeItems, practiceModuleId);
    if (targetExerciseId) {
      const ownerTab = practiceTabs?.find((tab) => tab.items.some((item) => item.id === targetExerciseId));
      if (ownerTab) setActivePracticeTabId(ownerTab.id);
      setSelectedPracticeExerciseId(targetExerciseId);
    }
    if (targetSlideIndex !== undefined) {
      setCurrentSlideIndex(targetSlideIndex);
      const targetSlide = slides[targetSlideIndex];
      if (isMobile && targetSlide) {
        setTimeout(() => {
          document.getElementById(`slide-${targetSlide.id}`)?.scrollIntoView({ behavior: 'smooth' });
        }, 30);
      }
    }
    if (!isMobile) resetMainScrollPosition();
  };

  const moduleSlides = slides.filter((slide) => slide.moduleId === currentSlide.moduleId);
  const currentModuleSlideIndex = moduleSlides.findIndex((slide) => slide.id === currentSlide.id);
  const currentPracticeExercise = activePracticeItems.find((exercise) => exercise.id === selectedPracticeExerciseId) ?? activePracticeItems[0];
  const activePracticeItemLabel = activePracticeTab?.itemSingularLabel ?? 'Ejercicio';
  const activeSectionTheme = SECTION_THEMES[activeModuleId];
  const currentModuleIndex = modules.findIndex((item) => item.id === activeModuleId);
  const currentModuleMetadata = modules[currentModuleIndex] ?? modules.find((item) => item.id === activeModuleId);
  const nextModule = currentModuleIndex !== -1 && currentModuleIndex < modules.length - 1
    ? modules[currentModuleIndex + 1]
    : undefined;
  const activeHeaderTitle = activeNote
    ? activeNote.title
    : isExamPracticeActive
      ? (currentModuleMetadata?.headerTitle ?? practiceHeadingTitle ?? 'Taller Práctico')
      : (currentSlide?.moduleTitle ?? currentModuleMetadata?.headerTitle ?? courseTitle);
  const activeHeaderSubtitle = activeNote
    ? `Apunte ${activeNoteIndex + 1} de ${notes.length} · PDF`
    : isExamPracticeActive
      ? `${currentModuleMetadata?.contractTag ?? 'Práctica'} · ${activePracticeItemLabel} #${currentPracticeExercise?.number ?? 1}`
      : `Diapositiva ${currentSlideIndex + 1} de ${slides.length}`;
  const activePracticeSubtopicKey = isExamPracticeActive
    ? (practiceTabs ? activePracticeTab?.id : currentPracticeExercise?.paradigm)
    : undefined;
  const activeSubtopicId = resolveActiveSubtopicId?.(
    activeModuleId,
    moduleSlides.map((slide) => slide.id),
    currentSlide.id,
    activePracticeSubtopicKey,
  );

  return (
    <div
      data-theme={themeMode}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`flex flex-col md:flex-row h-screen overflow-hidden ${activeSectionTheme.pageBgClass} text-zinc-900 transition-colors outline-none dark:text-zinc-100`}
    >
      <aside
        className={`hidden md:flex ${
          isSidebarCollapsed ? 'md:w-16' : 'md:w-72'
        } shrink-0 md:h-full md:overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <StudySidebar
          modules={modules}
          subtopicsByModuleId={subtopicsByModuleId}
          notes={notes}
          practiceModuleId={practiceModuleId}
          practiceTabs={practiceTabs}
          activePracticeTabId={activePracticeTab?.id}
          selectedPracticeExerciseId={currentPracticeExercise?.id}
          courseTitle={courseTitle}
          courseDepartment={courseDepartment}
          activeModuleId={activeModuleId}
          activeNoteId={activeNoteId}
          activeSlideId={currentSlide.id}
          activeSubtopicId={activeSubtopicId}
          activeExerciseParadigm={activePracticeSubtopicKey}
          completedItemIds={completedItemIds}
          progressPercentage={calculateStudyProgressPercentage(completedItemIds, trackableItemIds)}
          themeMode={themeMode}
          isCollapsed={isSidebarCollapsed}
          onSelectModule={handleSelectModule}
          onSelectNote={handleSelectNote}
          onSelectSubtopic={handleSelectSubtopic}
          onSelectPracticeItem={handleSelectPracticeItem}
          onToggleTheme={handleToggleTheme}
          onToggleCollapse={handleToggleCollapse}
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />
      </aside>

      {isMobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navegación del curso"
          className="fixed inset-0 z-50 flex md:hidden animate-fade-slide-in"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col overflow-hidden bg-zinc-100 shadow-2xl dark:bg-zinc-950">
            <StudySidebar
              modules={modules}
              subtopicsByModuleId={subtopicsByModuleId}
              notes={notes}
              practiceModuleId={practiceModuleId}
              practiceTabs={practiceTabs}
              activePracticeTabId={activePracticeTab?.id}
              selectedPracticeExerciseId={currentPracticeExercise?.id}
              courseTitle={courseTitle}
              courseDepartment={courseDepartment}
              activeModuleId={activeModuleId}
              activeNoteId={activeNoteId}
              activeSlideId={currentSlide.id}
              activeSubtopicId={activeSubtopicId}
              activeExerciseParadigm={activePracticeSubtopicKey}
              completedItemIds={completedItemIds}
              progressPercentage={calculateStudyProgressPercentage(completedItemIds, trackableItemIds)}
              themeMode={themeMode}
              isCollapsed={false}
              onSelectModule={handleSelectModule}
              onSelectNote={handleSelectNote}
              onSelectSubtopic={handleSelectSubtopic}
              onSelectPracticeItem={handleSelectPracticeItem}
              onToggleTheme={handleToggleTheme}
              onToggleCollapse={() => setIsMobileDrawerOpen(false)}
              onOpenSearch={() => {
                setIsMobileDrawerOpen(false);
                setIsSearchModalOpen(true);
              }}
              onCloseDrawer={() => setIsMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <header className="flex md:hidden items-center justify-between border-b border-zinc-200 bg-zinc-100/90 px-3 py-2 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Abrir menú de navegación"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 shadow-xs transition active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex flex-col">
              <span className="text-xs font-bold truncate text-zinc-900 dark:text-zinc-100">
                {activeHeaderTitle}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {activeHeaderSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              aria-label="Buscar contenidos"
              title="Buscar en la materia"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 shadow-xs transition active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={themeMode === 'emerald-night' ? 'Modo claro' : 'Modo nocturno'}
              title={themeMode === 'emerald-night' ? 'Cambiar a modo claro' : 'Cambiar a modo nocturno'}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 shadow-xs transition active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {themeMode === 'emerald-night' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

        <main ref={mainScrollContainerRef} className="animate-fade-slide-in flex-1 min-h-0 flex flex-col p-0 overflow-y-auto lg:overflow-hidden">
          {activeNote ? (
            <NoteDocumentView
              note={activeNote}
              noteIndex={activeNoteIndex}
              totalNotesCount={notes.length}
            />
          ) : isExamPracticeActive ? (
            <ExamPracticeView
              exercises={activePracticeItems}
              completedItemIds={completedItemIds}
              selectedExerciseId={selectedPracticeExerciseId}
              selectedParadigmFilter={selectedPracticeParadigm}
              headingTitle={practiceHeadingTitle}
              itemSingularLabel={activePracticeItemLabel}
              practiceModuleId={practiceModuleId}
              paradigmFilters={activePracticeTab?.paradigmFilters ?? paradigmFilters}
              originFilters={activePracticeTab?.originFilters ?? originFilters}
              practiceTabs={practiceTabs}
              activePracticeTabId={activePracticeTab?.id}
              matchesCategory={matchesPracticeCategory}
              renderVisualResource={renderExerciseVisualResource}
              resolveAllowedWorkspaceTabs={resolveAllowedWorkspaceTabs}
              tokenizeCode={tokenizeCode}
              onSelectExercise={setSelectedPracticeExerciseId}
              onSelectParadigmFilter={setSelectedPracticeParadigm}
              onSelectPracticeTab={(tabId) => {
                setActivePracticeTabId(tabId);
                setSelectedPracticeParadigm('all');
              }}
              onToggleCompletedItem={(itemId) => {
                const nextCompleted = completedItemIds.includes(itemId)
                  ? completedItemIds.filter((existingId) => existingId !== itemId)
                  : [...completedItemIds, itemId];
                setCompletedItemIds(nextCompleted);
                saveCompletedItemIds(nextCompleted);
              }}
            />
          ) : isMobile ? (
            <div className="flex flex-col gap-4 p-2.5 sm:p-4 pb-24">
              {moduleSlides.map((moduleSlide, index) => (
                <article
                  key={moduleSlide.id}
                  id={`slide-${moduleSlide.id}`}
                  className="w-full scroll-mt-14 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs"
                >
                  <PresentationSlideView
                    slide={moduleSlide}
                    currentSlideIndex={index}
                    totalSlidesCount={slides.length}
                    moduleSlideIndex={index}
                    moduleSlidesCount={moduleSlides.length}
                    courseBlockRegistry={courseBlockRegistry}
                    onNavigatePrevious={() => {}}
                    onNavigateNext={() => {}}
                    onOpenWorkspace={() => openSlideWorkspace(moduleSlide)}
                    isMobileFeed={true}
                  />
                </article>
              ))}

              {nextModule && (
                <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 text-center bg-zinc-50 dark:bg-zinc-900/50 my-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Fin de este módulo
                  </p>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mb-2">
                    Continuar al siguiente módulo
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleSelectModule(nextModule.id)}
                    aria-label={`Continuar a ${nextModule.sidebarTitle}`}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition bg-emerald-600 hover:bg-emerald-500"
                  >
                    <span>Continuar a {nextModule.sidebarTitle}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <PresentationSlideView
              slide={currentSlide}
              currentSlideIndex={currentSlideIndex}
              totalSlidesCount={slides.length}
              moduleSlideIndex={currentModuleSlideIndex !== -1 ? currentModuleSlideIndex : 0}
              moduleSlidesCount={moduleSlides.length}
              courseBlockRegistry={courseBlockRegistry}
              onNavigatePrevious={() => handleNavigateSlide(currentSlideIndex - 1)}
              onNavigateNext={() => handleNavigateSlide(currentSlideIndex + 1)}
              onOpenWorkspace={() => openSlideWorkspace(currentSlide)}
            />
          )}
        </main>
      </div>

      {isSearchModalOpen && (
        <div role="dialog" aria-modal="true" aria-label="Buscador de la materia" onClick={() => setIsSearchModalOpen(false)} className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-xs animate-fade-slide-in">
          <div className="w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
            <GlobalSearchBar entries={searchIndex} autoFocus onClose={() => setIsSearchModalOpen(false)} onSelectEntry={handleSelectSearchEntry} />
          </div>
        </div>
      )}

      {slideWorkspaceTarget && (
        <SlideWorkspaceModal
          moduleId={slideWorkspaceTarget.moduleId}
          moduleTitle={slideWorkspaceTarget.moduleTitle}
          tokenizeCode={tokenizeCode}
          onClose={() => setSlideWorkspaceTarget(null)}
        />
      )}
    </div>
  );
}

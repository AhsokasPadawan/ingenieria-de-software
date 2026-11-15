import { ExamExerciseItem, ExamParadigmCategory } from './core/domain/coreTypes';
import { PracticeTabItem } from './core/ui/practice/ExamPracticeView';
import { WorkspaceTab } from './core/ui/practice/WorkspaceHeaderBar';
import { StudyPlatformShell } from './core/ui/StudyPlatformShell';
import { COURSE_BLOCK_REGISTRY } from './course/components/courseBlockRegistry';
import { ExerciseVisualResource } from './course/components/ExerciseVisualResource';
import {
  COURSE_SEARCH_INDEX,
  COURSE_SLIDE_DECK,
  MODULE_NAVIGATION_LIST,
  PRACTICE_MODULE_ID,
} from './course/data/courseModulesData';
import { COURSE_NOTES_LIST } from './course/data/courseNotesData';
import {
  COURSE_TASKS_LIST,
  EXAM_EXERCISES_LIST,
  EXERCISE_UNIT_FILTERS,
  TASK_UNIT_FILTERS,
} from './course/data/examExercisesData';
import {
  MODULE_SUBTOPICS_LOOKUP,
  resolveActiveSubtopicId,
} from './course/data/moduleSubtopicsData';
import { tokenizeCode } from './course/domain/codeSyntaxHighlighter';

const TRACKABLE_STUDY_ITEM_IDS: readonly string[] = COURSE_TASKS_LIST.map(
  (task) => task.id,
);

const COURSE_PRACTICE_TABS: readonly PracticeTabItem[] = [
  {
    id: 'exercises',
    label: 'Ejercicios Prácticos',
    items: EXAM_EXERCISES_LIST,
    itemSingularLabel: 'Ejercicio',
    paradigmFilters: EXERCISE_UNIT_FILTERS,
  },
  {
    id: 'tasks',
    label: 'Tareas',
    items: COURSE_TASKS_LIST,
    itemSingularLabel: 'Tarea',
    paradigmFilters: TASK_UNIT_FILTERS,
  },
];

function matchesCoursePracticeCategory(
  exercise: ExamExerciseItem,
  selectedCategory: ExamParadigmCategory,
): boolean {
  if (selectedCategory === 'all') return true;
  return exercise.paradigm === selectedCategory;
}

function resolveCourseWorkspaceTabs(
  exercise: ExamExerciseItem,
  practiceTabId?: string,
): readonly WorkspaceTab[] {
  if (practiceTabId === 'tasks') {
    return exercise.number <= 3 ? ['code'] : ['text'];
  }
  return ['text'];
}

export function App() {
  return (
    <StudyPlatformShell
      courseTitle="Ingeniería de Software — Ingenio y Diseño"
      courseDepartment="UADE"
      modules={MODULE_NAVIGATION_LIST}
      subtopicsByModuleId={MODULE_SUBTOPICS_LOOKUP}
      notes={COURSE_NOTES_LIST}
      slides={COURSE_SLIDE_DECK}
      exercises={EXAM_EXERCISES_LIST}
      practiceTabs={COURSE_PRACTICE_TABS}
      searchIndex={COURSE_SEARCH_INDEX}
      trackableItemIds={TRACKABLE_STUDY_ITEM_IDS}
      practiceModuleId={PRACTICE_MODULE_ID}
      practiceHeadingTitle="Práctica: Ejercicios y Tareas de Ingeniería de Software"
      paradigmFilters={EXERCISE_UNIT_FILTERS}
      courseBlockRegistry={COURSE_BLOCK_REGISTRY}
      resolveActiveSubtopicId={resolveActiveSubtopicId}
      matchesPracticeCategory={matchesCoursePracticeCategory}
      resolveAllowedWorkspaceTabs={resolveCourseWorkspaceTabs}
      renderExerciseVisualResource={(resource, exerciseId) => (
        <ExerciseVisualResource resource={resource} exerciseId={exerciseId} />
      )}
      tokenizeCode={tokenizeCode}
    />
  );
}

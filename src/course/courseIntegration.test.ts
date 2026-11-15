import { describe, expect, it } from 'vitest';
import {
  COURSE_BLOCK_REGISTRY,
  VISUALIZER_LOOKUP,
} from './components/courseBlockRegistry';
import {
  COURSE_SEARCH_INDEX,
  COURSE_SLIDE_DECK,
  MODULE_NAVIGATION_LIST,
  PRACTICE_MODULE_ID,
  STUDY_MODULES_BY_ID,
} from './data/courseModulesData';
import { COURSE_TASKS_LIST, EXAM_EXERCISES_LIST } from './data/examExercisesData';
import { MODULE_SUBTOPICS_LOOKUP } from './data/moduleSubtopicsData';
import { tokenizeCode } from './domain/codeSyntaxHighlighter';

describe('Course integration and navigation integrity', () => {
  it('loads all 6 theory units plus the practice module and binds all 6 visualizers', () => {
    expect(MODULE_NAVIGATION_LIST).toHaveLength(7);
    expect(Object.keys(STUDY_MODULES_BY_ID)).toHaveLength(6);

    const boundVisualizerIds = new Set(
      COURSE_SLIDE_DECK.filter((slide) => slide.slideKind === 'visualizer')
        .map((slide) => slide.visualizerId)
        .filter(Boolean),
    );

    expect(Object.keys(VISUALIZER_LOOKUP)).toHaveLength(6);
    for (const visualizerId of Object.keys(VISUALIZER_LOOKUP)) {
      expect(boundVisualizerIds.has(visualizerId)).toBe(true);
    }
    expect(COURSE_BLOCK_REGISTRY.visualizer).toBeDefined();
    expect(COURSE_BLOCK_REGISTRY.code).toBeDefined();
  });

  it('ensures every sidebar subtopic slideId resolves to an existing slide in COURSE_SLIDE_DECK', () => {
    const deckSlideIds = new Set(COURSE_SLIDE_DECK.map((slide) => slide.id));

    for (const [moduleId, subtopics] of Object.entries(MODULE_SUBTOPICS_LOOKUP)) {
      expect(subtopics.length).toBeGreaterThan(0);
      for (const subtopic of subtopics) {
        if (moduleId === PRACTICE_MODULE_ID) {
          expect(subtopic.paradigm).toBeDefined();
        } else if (subtopic.slideId) {
          expect(deckSlideIds.has(subtopic.slideId)).toBe(true);
        }
      }
    }
  });

  it('indexes theory slides, exercises, and tasks in COURSE_SEARCH_INDEX', () => {
    const indexedIds = new Set(COURSE_SEARCH_INDEX.map((entry) => entry.anchorId));

    for (const exercise of EXAM_EXERCISES_LIST) {
      expect(indexedIds.has(exercise.id)).toBe(true);
    }
    for (const task of COURSE_TASKS_LIST) {
      expect(indexedIds.has(task.id)).toBe(true);
    }
  });

  it('tokenizes C# and Java snippets with syntax highlighting classes', () => {
    const csharpTokens = tokenizeCode('public sealed class MoveCommand : ICommand {}', 'csharp');
    expect(csharpTokens.some((token) => token.text === 'public')).toBe(true);
    expect(csharpTokens.some((token) => token.text === 'sealed')).toBe(true);

    const javaTokens = tokenizeCode('public record AuditEntry(String hash) {}', 'java');
    expect(javaTokens.some((token) => token.text === 'record')).toBe(true);
    expect(javaTokens.some((token) => token.text === 'String')).toBe(true);
  });
});

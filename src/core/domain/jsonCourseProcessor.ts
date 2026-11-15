import {
  AlgorithmShowcaseItem,
  CodeLanguage,
  CodeSnippetsByLanguage,
  ConceptCardItem,
  ConceptFormulaItem,
  ExamExerciseComplexityAnalysis,
  ExamExerciseConceptualStrategy,
  ExamExerciseItem,
  ExamExerciseVisualResource,
  ModuleMetadata,
  ModuleStudyData,
  TheoryBlockLayout,
  TheorySlideBlockItem,
} from './coreTypes';

interface RawFormulaItem {
  label?: string;
  latex?: string;
  description?: string;
}

interface RawConceptItem {
  id?: string;
  title?: string;
  badgeText?: string;
  summary?: string;
  bulletPoints?: string[];
  formulas?: RawFormulaItem[];
}

interface RawCodeSnippets {
  pseudocode?: string;
  csharp?: string;
  java?: string;
  python?: string;
}

interface RawAlgorithmItem {
  id?: string;
  name?: string;
  paradigmTag?: string;
  bestCaseComplexityLatex?: string;
  averageCaseComplexityLatex?: string;
  worstCaseComplexityLatex?: string;
  spaceComplexityLatex?: string;
  recurrenceOrEquationLatex?: string;
  keyInsight?: string;
  stepByStepSummary?: string[];
  codeSnippets?: RawCodeSnippets;
}

interface RawSubtopicCodeBlock {
  lenguaje?: string;
  codigo_fuente?: string;
  codigo?: string;
}

interface RawSubtopicComplexity {
  temporal?: string;
  temporal_peor_caso?: string;
  temporal_mejor_caso?: string;
  espacial?: string;
  teorema_aplicado?: string | null;
  observaciones?: string;
  justificacion?: string;
}

interface RawTheoryConceptItem {
  nombre?: string;
  definicion?: string;
  etiqueta_items?: string;
  items?: string[];
}

interface RawTheoryDetailsGroup {
  etiqueta?: string;
  items?: string[];
}

interface RawTheoryTableData {
  columnas?: string[];
  filas?: string[][];
}

interface RawTheoryBlockItem {
  tema?: string;
  definicion?: string;
  layout_conceptos?: TheoryBlockLayout;
  conceptos?: RawTheoryConceptItem[];
  detalles?: RawTheoryDetailsGroup;
  diagrama_mermaid?: string;
  tabla?: RawTheoryTableData;
  conclusion?: string;
}

interface RawSectionSubtopic {
  id?: string;
  titulo?: string;
  teoria?: string;
  bloques?: RawTheoryBlockItem[];
  pseudocodigo?: string | null;
  codigo?: RawSubtopicCodeBlock | string | null;
  analisis_complejidad?: RawSubtopicComplexity | null;
}

interface RawTheorySection {
  id?: string;
  titulo?: string;
  subtemas?: RawSectionSubtopic[];
}

interface RawTheoryPayload {
  modulo?: string;
  titulo_general?: string;
  secciones?: RawTheorySection[];
  conceptos?: RawConceptItem[];
  concepts?: RawConceptItem[];
  algoritmos?: RawAlgorithmItem[];
  algorithms?: RawAlgorithmItem[];
}

export interface RawExerciseVisualResource {
  tipo: string;
  formato?: string;
  codigo?: string;
  contenido?: string;
}

export interface RawExerciseResolutionProposal {
  fuente_propuesta?: string;
  clasificacion?: string;
  complejidad_esperada?: string | null;
  estrategia_sugerida?: string;
  [key: string]: unknown;
}

export interface RawExerciseItem {
  id_tema?: number;
  id_global?: number;
  tema?: string;
  titulo: string;
  enunciado: string;
  recurso_visual?: RawExerciseVisualResource | null;
  fuente_original?: string;
  resolucion_propuesta?: RawExerciseResolutionProposal[];
}

export interface RawExercisesData {
  modulo?: string;
  metadata?: {
    titulo?: string;
    descripcion?: string;
    temas?: string[];
  };
  ejercicios?: RawExerciseItem[];
  ejercicios_por_tema?: Record<string, RawExerciseItem[]>;
}

export interface ExerciseParserConfig {
  categoryLabels?: Record<string, string>;
  defaultCategory?: string;
  canonicalTitlesBySlug?: Record<string, string>;
  canonicalIdsBySlug?: Record<string, string>;
  strategiesByCategory?: Record<string, ExamExerciseConceptualStrategy>;
  resolveTargetComplexity?: (statement: string, category: string) => string;
  resolveComplexityAnalysis?: (
    targetComplexityLatex: string,
    category: string,
  ) => ExamExerciseComplexityAnalysis;
  buildCodeSnippets?: (title: string) => CodeSnippetsByLanguage;
  resolveSourceLabels?: (rawSource: string) => {
    difficultyLabel: string;
    sourceOrigin: string;
  };
}

export function slugifyStudyIdentifier(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 36);
}

function normalizeFormulas(
  formulas?: RawFormulaItem[],
): ConceptFormulaItem[] | undefined {
  if (!formulas || !Array.isArray(formulas)) {
    return undefined;
  }
  return formulas.map((formula) => ({
    label: formula.label ?? '',
    latex: formula.latex ?? '',
    description: formula.description ?? '',
  }));
}

function normalizeCodeSnippets(
  snippets?: RawCodeSnippets,
): CodeSnippetsByLanguage {
  return {
    pseudocode: snippets?.pseudocode ?? '',
    csharp: snippets?.csharp ?? '',
    java: snippets?.java ?? '',
    python: snippets?.python ?? '',
  };
}

function splitMarkdownBulletPoints(rawTheoryText: string): {
  summary: string;
  bulletPoints: string[];
} {
  const rawLines = rawTheoryText.split(/\r?\n/);
  const summaryLines: string[] = [];
  const bulletPoints: string[] = [];
  let currentBullet: string[] = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const isBullet = /^([-*•]|\d+\.)\s+/.test(trimmed);
    if (isBullet) {
      if (currentBullet.length > 0) {
        bulletPoints.push(currentBullet.join('\n'));
        currentBullet = [];
      }
      currentBullet.push(trimmed.replace(/^([-*•]|\d+\.)\s+/, '').trim());
    } else if (bulletPoints.length === 0 && currentBullet.length === 0) {
      summaryLines.push(trimmed);
    } else if (currentBullet.length > 0) {
      currentBullet.push(trimmed);
    }
  }

  if (currentBullet.length > 0) {
    bulletPoints.push(currentBullet.join('\n'));
  }

  const summary = summaryLines.join('\n');
  return { summary, bulletPoints };
}

function normalizeTheoryBlocks(
  rawBlocks?: RawTheoryBlockItem[],
): TheorySlideBlockItem[] | undefined {
  if (!Array.isArray(rawBlocks) || rawBlocks.length === 0) {
    return undefined;
  }

  return rawBlocks.map((block) => ({
    tema: block.tema ?? '',
    definicion: block.definicion,
    layout_conceptos: block.layout_conceptos,
    conceptos: block.conceptos?.map((concept) => ({
      nombre: concept.nombre ?? '',
      definicion: concept.definicion,
      etiqueta_items: concept.etiqueta_items,
      items: concept.items,
    })),
    detalles: block.detalles
      ? {
          etiqueta: block.detalles.etiqueta,
          items: block.detalles.items ?? [],
        }
      : undefined,
    diagrama_mermaid: block.diagrama_mermaid,
    tabla: block.tabla
      ? {
          columnas: block.tabla.columnas ?? [],
          filas: block.tabla.filas ?? [],
        }
      : undefined,
    conclusion: block.conclusion,
  }));
}

function buildSearchSummaryFromBlocks(blocks: TheorySlideBlockItem[]): string {
  return blocks
    .flatMap((block) => [
      block.tema,
      block.definicion ?? '',
      ...(block.conceptos?.flatMap((concept) => [
        concept.nombre,
        concept.definicion ?? '',
        ...(concept.items ?? []),
      ]) ?? []),
      ...(block.detalles?.items ?? []),
      block.conclusion ?? '',
    ])
    .filter(Boolean)
    .join(' ');
}

const LANGUAGE_FIELD_LOOKUP: Record<string, CodeLanguage> = {
  csharp: 'csharp',
  'c#': 'csharp',
  cs: 'csharp',
  python: 'python',
  py: 'python',
  pseudocode: 'pseudocode',
  pseudocodigo: 'pseudocode',
  java: 'java',
};

const LANGUAGE_DISPLAY_LABELS: Record<CodeLanguage, string> = {
  pseudocode: 'Pseudocódigo',
  csharp: 'C#',
  java: 'Java',
  python: 'Python',
};

function detectStringCodeLanguage(sourceCode: string, subtopicId: string): CodeLanguage {
  if (
    subtopicId.includes('java') ||
    /\b(import\s+java\.|System\.out|MessageDigest|Mac\.getInstance|SecretKeySpec|HexFormat)\b/.test(
      sourceCode,
    )
  ) {
    return 'java';
  }
  return 'csharp';
}

function resolveSubtopicCodePayload(
  rawCodigo: RawSubtopicCodeBlock | string | null | undefined,
  subtopicId: string,
): { sourceCode: string; language: CodeLanguage } | null {
  if (!rawCodigo) {
    return null;
  }

  if (typeof rawCodigo === 'string') {
    const trimmed = rawCodigo.trim();
    if (!trimmed) {
      return null;
    }
    return {
      sourceCode: rawCodigo,
      language: detectStringCodeLanguage(rawCodigo, subtopicId),
    };
  }

  const sourceCode = rawCodigo.codigo_fuente ?? rawCodigo.codigo ?? '';
  if (!sourceCode.trim()) {
    return null;
  }

  const normalizedLang = (rawCodigo.lenguaje ?? 'java').toLowerCase().trim();
  return {
    sourceCode,
    language: LANGUAGE_FIELD_LOOKUP[normalizedLang] ?? 'java',
  };
}

function buildSingleLanguageSnippets(
  sourceCode: string,
  language: CodeLanguage,
  pseudocode = '',
): CodeSnippetsByLanguage {
  return {
    pseudocode,
    csharp: language === 'csharp' ? sourceCode : '',
    java: language === 'java' ? sourceCode : '',
    python: language === 'python' ? sourceCode : '',
  };
}

function extractSectionsFallback(
  sections: RawTheorySection[],
  metadata: ModuleMetadata,
): { concepts: ConceptCardItem[]; algorithms: AlgorithmShowcaseItem[] } {
  const concepts: ConceptCardItem[] = [];
  const algorithms: AlgorithmShowcaseItem[] = [];

  for (const section of sections) {
    const badgeText = section.titulo ?? 'Fundamento Teórico';
    for (const subtopic of section.subtemas ?? []) {
      const subtopicId =
        subtopic.id ?? `${metadata.id}-subtopic-${concepts.length + 1}`;
      const subtopicTitle = subtopic.titulo ?? '';
      const blocks = normalizeTheoryBlocks(subtopic.bloques);
      const { summary: parsedSummary, bulletPoints } = splitMarkdownBulletPoints(
        subtopic.teoria ?? '',
      );
      const summary =
        parsedSummary || (blocks ? buildSearchSummaryFromBlocks(blocks) : '');

      const resolvedCode = resolveSubtopicCodePayload(subtopic.codigo, subtopicId);
      const isAlgorithmSubtopic = Boolean(
        subtopic.pseudocodigo || subtopic.analisis_complejidad,
      );

      concepts.push({
        id: subtopicId,
        title: subtopicTitle,
        badgeText,
        summary,
        bulletPoints,
        blocks,
        codeSnippet:
          !isAlgorithmSubtopic && resolvedCode
            ? {
                title: `${subtopicTitle} (${LANGUAGE_DISPLAY_LABELS[resolvedCode.language]})`,
                snippets: buildSingleLanguageSnippets(
                  resolvedCode.sourceCode,
                  resolvedCode.language,
                ),
                preferredLanguage: resolvedCode.language,
              }
            : undefined,
      });

      if (isAlgorithmSubtopic) {
        const complexity = subtopic.analisis_complejidad;
        const worstCase =
          complexity?.temporal ?? complexity?.temporal_peor_caso ?? 'O(n)';
        const bestCase = complexity?.temporal_mejor_caso ?? worstCase;
        const targetField = resolvedCode?.language ?? 'java';
        const rawSourceCode = resolvedCode?.sourceCode ?? '';

        algorithms.push({
          id: `${subtopicId}-algo`,
          name: subtopicTitle,
          paradigmTag: badgeText,
          bestCaseComplexityLatex: bestCase,
          averageCaseComplexityLatex: worstCase,
          worstCaseComplexityLatex: worstCase,
          spaceComplexityLatex: complexity?.espacial ?? 'O(1)',
          recurrenceOrEquationLatex: complexity?.teorema_aplicado ?? worstCase,
          keyInsight:
            complexity?.observaciones ?? complexity?.justificacion ?? summary,
          stepByStepSummary: bulletPoints,
          codeSnippets: buildSingleLanguageSnippets(
            rawSourceCode,
            targetField,
            subtopic.pseudocodigo ?? '',
          ),
        });
      }
    }
  }

  return { concepts, algorithms };
}

export function parseRawTheoryModuleData(
  raw: unknown,
  metadata: ModuleMetadata,
): ModuleStudyData {
  if (!raw || typeof raw !== 'object') {
    return {
      metadata,
      concepts: [],
      algorithms: [],
    };
  }

  const payload = raw as RawTheoryPayload;
  const hasExplicitConceptsOrAlgorithms =
    Array.isArray(payload.conceptos) ||
    Array.isArray(payload.concepts) ||
    Array.isArray(payload.algoritmos) ||
    Array.isArray(payload.algorithms);

  if (!hasExplicitConceptsOrAlgorithms && Array.isArray(payload.secciones)) {
    const extracted = extractSectionsFallback(payload.secciones, metadata);
    return {
      metadata,
      concepts: extracted.concepts,
      algorithms: extracted.algorithms,
    };
  }

  const rawConcepts = payload.conceptos ?? payload.concepts ?? [];
  const rawAlgorithms = payload.algoritmos ?? payload.algorithms ?? [];

  const concepts: ConceptCardItem[] = rawConcepts.map((item, index) => ({
    id: item.id ?? `${metadata.id}-concept-${index + 1}`,
    title: item.title ?? '',
    badgeText: item.badgeText ?? 'Fundamento Teórico',
    summary: item.summary ?? '',
    bulletPoints: item.bulletPoints ?? [],
    formulas: normalizeFormulas(item.formulas),
  }));

  const algorithms: AlgorithmShowcaseItem[] = rawAlgorithms.map((item, index) => ({
    id: item.id ?? `${metadata.id}-algo-${index + 1}`,
    name: item.name ?? '',
    paradigmTag: item.paradigmTag ?? metadata.sidebarTitle,
    bestCaseComplexityLatex: item.bestCaseComplexityLatex ?? 'O(1)',
    averageCaseComplexityLatex: item.averageCaseComplexityLatex ?? 'O(n)',
    worstCaseComplexityLatex: item.worstCaseComplexityLatex ?? 'O(n)',
    spaceComplexityLatex: item.spaceComplexityLatex ?? 'O(1)',
    recurrenceOrEquationLatex: item.recurrenceOrEquationLatex ?? '',
    keyInsight: item.keyInsight ?? '',
    stepByStepSummary: item.stepByStepSummary ?? [],
    codeSnippets: normalizeCodeSnippets(item.codeSnippets),
  }));

  return {
    metadata,
    concepts,
    algorithms,
  };
}

function buildDefaultCodeSnippets(title: string): CodeSnippetsByLanguage {
  const safeName = title
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  return {
    pseudocode: `Funcion Resolver${safeName || 'Problema'}(datos)\nInicio\n    Devolver resultado\nFin`,
    java: `public class Solution {\n    public static void resolver() {\n    }\n}`,
    python: `def resolver(datos):\n    pass`,
  };
}

function resolveDefaultSourceLabels(rawSource: string): {
  difficultyLabel: string;
  sourceOrigin: string;
} {
  const isExam = rawSource.toLowerCase().includes('parcial');
  return {
    difficultyLabel: isExam ? 'Examen Parcial' : 'Guía Práctica',
    sourceOrigin: isExam ? 'Parcial' : 'Guía Práctica',
  };
}

function extractExercisesByTopicMap(
  payload: RawExercisesData,
): { categories: string[]; exercisesByTopic: Record<string, RawExerciseItem[]> } {
  if (payload.ejercicios_por_tema) {
    const categories =
      payload.metadata?.temas ?? Object.keys(payload.ejercicios_por_tema);
    return {
      categories,
      exercisesByTopic: payload.ejercicios_por_tema,
    };
  }

  if (Array.isArray(payload.ejercicios)) {
    const topicKey = payload.modulo ?? 'general';
    return {
      categories: [topicKey],
      exercisesByTopic: { [topicKey]: payload.ejercicios },
    };
  }

  return { categories: [], exercisesByTopic: {} };
}

export function parseRawExercisesData(
  raw: unknown,
  config: ExerciseParserConfig = {},
): ExamExerciseItem[] {
  if (!raw || typeof raw !== 'object') {
    return [];
  }

  const payload = raw as RawExercisesData;
  const { categories, exercisesByTopic } = extractExercisesByTopicMap(payload);
  const result: ExamExerciseItem[] = [];
  let globalIndex = 1;

  for (const topicKey of categories) {
    const items = exercisesByTopic[topicKey] ?? [];
    for (const item of items) {
      const category =
        config.categoryLabels?.[topicKey] ??
        config.defaultCategory ??
        item.tema ??
        topicKey;
      const rawSlug = slugifyStudyIdentifier(item.titulo);
      const title = config.canonicalTitlesBySlug?.[rawSlug] ?? item.titulo;
      const id =
        config.canonicalIdsBySlug?.[rawSlug] ?? `exam-${globalIndex}-${rawSlug}`;
      const { difficultyLabel, sourceOrigin } = config.resolveSourceLabels
        ? config.resolveSourceLabels(item.fuente_original ?? '')
        : resolveDefaultSourceLabels(item.fuente_original ?? '');

      const proposalComplexity =
        item.resolucion_propuesta?.[0]?.complejidad_esperada;
      const targetComplexityLatex = config.resolveTargetComplexity
        ? config.resolveTargetComplexity(item.enunciado, category)
        : proposalComplexity ?? '\\mathcal{O}(n)';

      const proposalStrategy = item.resolucion_propuesta?.[0]?.estrategia_sugerida;
      const conceptualStrategy =
        config.strategiesByCategory?.[category] ??
        (proposalStrategy
          ? {
              invariantAndIntuition: proposalStrategy,
              keySteps: [proposalStrategy],
              recurrenceOrTransitionLatex: targetComplexityLatex,
            }
          : undefined);

      const codeSnippets = config.buildCodeSnippets
        ? config.buildCodeSnippets(item.titulo)
        : buildDefaultCodeSnippets(item.titulo);

      const complexityAnalysis = config.resolveComplexityAnalysis
        ? config.resolveComplexityAnalysis(targetComplexityLatex, category)
        : {
            temporalLatex: targetComplexityLatex,
            spatialLatex: '\\mathcal{O}(n)',
            justification:
              'Análisis derivado de la estructura de datos y transiciones del problema.',
            theoremApplied: 'Conteo de operaciones',
          };

      result.push({
        id,
        number: globalIndex,
        title,
        paradigm: category,
        difficultyLabel,
        targetComplexityLatex,
        sourceOrigin,
        problemStatement: item.enunciado,
        inputOutputExample: item.recurso_visual
          ? 'Ver recurso visual adjunto y casos de prueba.'
          : 'Ver casos y especificaciones en la consigna formal.',
        recursoVisual: item.recurso_visual
          ? {
              tipo: item.recurso_visual.tipo as ExamExerciseVisualResource['tipo'],
              formato: item.recurso_visual.formato ?? item.recurso_visual.tipo,
              codigo: item.recurso_visual.codigo ?? item.recurso_visual.contenido ?? '',
            }
          : null,
        conceptualStrategy,
        codeSnippets,
        complexityAnalysis,
      });

      globalIndex++;
    }
  }

  return result;
}

import { useEffect, useState } from 'react';
import {
  TheoryBlockLayout,
  TheoryConceptItem,
  TheorySlideBlockItem,
} from '../../domain/coreTypes';
import { SectionTheme } from '../../domain/sectionThemes';
import { parseInlineTokens } from './slideTypographyHelpers';

interface StructuredTheoryBlocksViewProps {
  slideId: string;
  blocks: TheorySlideBlockItem[];
  sectionTheme: SectionTheme;
}

const CONCEPT_LAYOUT_CLASSES: Record<TheoryBlockLayout, string> = {
  'grid-2': 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4',
  'grid-3': 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4',
  lista: 'flex flex-col items-center gap-5 sm:gap-6',
  escalonada: 'flex flex-col gap-5 sm:gap-6',
};

const STAGGERED_ALIGNMENT_CLASSES: readonly string[] = [
  'md:self-start',
  'md:self-center',
  'md:self-end',
];

function TheoryMermaidDiagram({ code, diagramId }: { code: string; diagramId: string }) {
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    import('mermaid')
      .then((mermaidModule) => {
        const mermaid = mermaidModule.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose',
          themeVariables: {
            fontSize: '15px',
          },
          flowchart: {
            nodeSpacing: 35,
            rankSpacing: 45,
            padding: 14,
            useMaxWidth: true,
          },
        });

        const safeId = `theory_mermaid_${diagramId.replace(/[^a-zA-Z0-9]/g, '_')}_${Math.random().toString(36).slice(2, 7)}`;
        return mermaid.render(safeId, code);
      })
      .then(({ svg }) => {
        if (isMounted) {
          setSvgHtml(svg);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [code, diagramId]);

  if (hasError) {
    return (
      <pre className="p-3 bg-zinc-950 font-mono text-xs text-amber-300 rounded-xl overflow-x-auto border border-zinc-800">
        {code}
      </pre>
    );
  }

  if (!svgHtml) {
    return (
      <div className="flex items-center justify-center p-4 text-zinc-500 font-mono text-xs">
        Renderizando diagrama...
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-100 p-3 sm:p-4 flex justify-center items-center [&>svg]:max-h-[340px] md:[&>svg]:max-h-[420px] [&>svg]:max-w-full [&>svg]:w-auto [&>svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}

function ConceptCard({
  concept,
  sectionTheme,
  className = '',
}: {
  concept: TheoryConceptItem;
  sectionTheme: SectionTheme;
  className?: string;
}) {
  return (
    <div
      className={`${className} rounded-xl border px-5 py-3.5 sm:px-6 sm:py-4 flex flex-col items-center text-center justify-center gap-2 ${sectionTheme.analysisSubcardClass}`}
    >
      <h4 className={`text-base sm:text-lg md:text-xl font-bold ${sectionTheme.strongTextClass}`}>
        {parseInlineTokens(concept.nombre)}
      </h4>
      {concept.definicion && (
        <p className="text-sm sm:text-base md:text-lg font-medium text-zinc-700 dark:text-zinc-300 leading-snug">
          {parseInlineTokens(concept.definicion)}
        </p>
      )}
      {concept.items && concept.items.length > 0 && (
        <div className="flex flex-col items-center gap-1.5 mt-0.5">
          {concept.etiqueta_items && (
            <span
              className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${sectionTheme.slideHeaderClass}`}
            >
              {concept.etiqueta_items}
            </span>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {concept.items.map((itemText, itemIndex) => (
              <span
                key={itemIndex}
                className={`rounded-lg border px-3.5 py-1 text-sm sm:text-base font-semibold ${sectionTheme.analysisInnerCellClass} ${sectionTheme.titleTextClass}`}
              >
                {parseInlineTokens(itemText)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function StructuredTheoryBlocksView({
  slideId,
  blocks,
  sectionTheme,
}: StructuredTheoryBlocksViewProps) {
  return (
    <div className="w-full h-auto md:h-full md:flex-1 flex flex-col justify-start gap-3 overflow-visible md:overflow-y-auto py-1">
      {blocks.map((block, blockIndex) => {
        const layoutClass =
          CONCEPT_LAYOUT_CLASSES[block.layout_conceptos ?? 'grid-2'];
        const hasConcepts = Boolean(block.conceptos && block.conceptos.length > 0);
        const hasDetails = Boolean(block.detalles && block.detalles.items.length > 0);
        const hasTable = Boolean(block.tabla && block.tabla.columnas.length > 0);
        const hasMermaid = Boolean(block.diagrama_mermaid);
        const hasSideBySideDiagram = hasMermaid && (hasConcepts || hasDetails) && !hasTable;
        const splitThirdConceptAboveDiagram = Boolean(
          hasSideBySideDiagram && block.conceptos && block.conceptos.length === 3,
        );
        const leftColumnConcepts = splitThirdConceptAboveDiagram
          ? block.conceptos?.slice(0, 2)
          : block.conceptos;
        const rightColumnTopConcept = splitThirdConceptAboveDiagram
          ? block.conceptos?.[2]
          : undefined;
        const isDenseBlock =
          (block.conceptos?.length ?? 0) >= 5 ||
          (block.tabla?.filas.length ?? 0) >= 5 ||
          (block.detalles?.items.length ?? 0) >= 6;

        return (
          <div
            key={`${block.tema}-${blockIndex}`}
            className={`rounded-2xl border bg-white dark:bg-zinc-900 ${
              isDenseBlock
                ? 'px-5 py-4 sm:px-7 sm:py-5 gap-4'
                : 'px-7 py-6 sm:px-10 sm:py-8 gap-6 sm:gap-7'
            } shadow-xs flex flex-col justify-start ${sectionTheme.cardBorderClass}`}
          >
            <div className="shrink-0">
              <h3
                className={`text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight ${sectionTheme.titleTextClass}`}
              >
                {parseInlineTokens(block.tema)}
              </h3>
              {block.definicion && (
                <p className="mt-2 text-base sm:text-lg md:text-xl font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {parseInlineTokens(block.definicion)}
                </p>
              )}
            </div>

            <div
              className={
                hasSideBySideDiagram
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-center'
                  : 'flex flex-col gap-3'
              }
            >
              {(hasConcepts || hasDetails) && (
                <div className="flex flex-col gap-3">
                  {hasConcepts && (
                    <div className={hasSideBySideDiagram ? 'flex flex-col gap-3' : layoutClass}>
                      {leftColumnConcepts?.map((concept, conceptIndex) => {
                        const isStaggered =
                          block.layout_conceptos === 'escalonada' && !hasSideBySideDiagram;
                        const isList =
                          block.layout_conceptos === 'lista' && !hasSideBySideDiagram;
                        const widthAndAlignClass = isStaggered
                          ? `w-full md:w-[58%] lg:w-[50%] ${STAGGERED_ALIGNMENT_CLASSES[conceptIndex % STAGGERED_ALIGNMENT_CLASSES.length]}`
                          : isList
                            ? 'w-fit max-w-full'
                            : '';
                        return (
                          <ConceptCard
                            key={`${concept.nombre}-${conceptIndex}`}
                            concept={concept}
                            sectionTheme={sectionTheme}
                            className={widthAndAlignClass}
                          />
                        );
                      })}
                    </div>
                  )}

                  {hasDetails && block.detalles && (
                    <div className={`flex flex-col gap-3.5 border-t pt-5 ${sectionTheme.cardBorderClass}`}>
                      {block.detalles.etiqueta && (
                        <span
                          className={`text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight ${sectionTheme.titleTextClass}`}
                        >
                          {block.detalles.etiqueta}
                        </span>
                      )}
                      <div className="flex flex-col gap-2.5">
                        {block.detalles.items.map((itemText, itemIndex) => (
                          <div
                            key={itemIndex}
                            className={`flex items-center gap-3.5 rounded-xl border px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base font-semibold ${sectionTheme.analysisSubcardClass} ${sectionTheme.titleTextClass}`}
                          >
                            <span
                              className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-black ${sectionTheme.stepBadgeClass}`}
                            >
                              {itemIndex + 1}
                            </span>
                            <span className="leading-snug">{parseInlineTokens(itemText)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {block.diagrama_mermaid && (
                <div className="w-full flex flex-col gap-3">
                  {rightColumnTopConcept && (
                    <ConceptCard
                      concept={rightColumnTopConcept}
                      sectionTheme={sectionTheme}
                    />
                  )}
                  <TheoryMermaidDiagram
                    code={block.diagrama_mermaid}
                    diagramId={`${slideId}_${blockIndex}`}
                  />
                </div>
              )}
            </div>

            {hasTable && block.tabla && (
              <div
                className={`my-auto overflow-x-auto rounded-xl border ${sectionTheme.cardBorderClass}`}
              >
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className={`border-b ${sectionTheme.analysisSubcardClass} ${sectionTheme.cardBorderClass}`}>
                      {block.tabla.columnas.map((col, colIndex) => (
                        <th
                          key={colIndex}
                          className={`px-2.5 ${isDenseBlock ? 'py-1.5' : 'py-2'} font-black uppercase tracking-wider text-[11px] sm:text-xs ${sectionTheme.slideHeaderClass}`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.tabla.filas.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={`border-b last:border-b-0 ${sectionTheme.cardBorderClass}`}
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className={`px-2.5 ${isDenseBlock ? 'py-1.5' : 'py-2'} font-medium text-zinc-800 dark:text-zinc-200 align-top`}
                          >
                            {parseInlineTokens(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {block.conclusion && (
              <div
                className={`shrink-0 rounded-xl border px-3 py-2 text-xs sm:text-sm font-semibold ${sectionTheme.accentSurfaceClass} ${sectionTheme.strongTextClass}`}
              >
                {parseInlineTokens(block.conclusion)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

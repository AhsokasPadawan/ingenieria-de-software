import { SlideBlockComponentProps } from '../../core/ui/slides/defaultBlockRegistry';

const COMMON_DATA_TYPES = ['int', 'float', 'double', 'bool', 'char', 'string'] as const;

const SELECTION_QUESTIONS = [
  '¿Qué valores puede contener?',
  '¿Cuánto espacio ocupa?',
] as const;

const OPERATOR_GROUPS = [
  {
    name: 'Aritméticas',
    examples: ['+', '-', '*', '/'],
  },
  {
    name: 'Comparación',
    examples: ['==', '!=', '>', '<'],
  },
  {
    name: 'Lógicas',
    examples: ['&&', '||', '!'],
  },
] as const;

export function VariablesTypesOperatorsSlide({ sectionTheme }: SlideBlockComponentProps) {
  return (
    <div className="w-full h-auto md:h-full md:flex-1 flex flex-col justify-between gap-2.5 sm:gap-3 overflow-visible md:overflow-hidden">
      <div
        className={`shrink-0 rounded-2xl border border-l-4 bg-white dark:bg-zinc-900 px-5 py-3.5 sm:px-6 sm:py-4 shadow-md ${sectionTheme.cardBorderClass} ${sectionTheme.inlineAccentBorderClass}`}
      >
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-snug text-zinc-800 dark:text-zinc-200">
          <strong className={`font-black ${sectionTheme.titleTextClass}`}>Variable:</strong> es un
          espacio de memoria que almacena información.
        </p>
      </div>

      <div
        className={`md:flex-[1.2_1_0%] min-h-0 rounded-2xl border bg-white dark:bg-zinc-900 px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs flex flex-col justify-start ${sectionTheme.cardBorderClass}`}
      >
        <h3
          className={`shrink-0 text-sm sm:text-base md:text-lg font-black tracking-tight mb-2 ${sectionTheme.titleTextClass}`}
        >
          Tipos comunes
        </h3>
        <div className="my-auto grid grid-cols-3 gap-2">
          {COMMON_DATA_TYPES.map((dataType) => (
            <div
              key={dataType}
              className={`rounded-xl border px-3 py-2 sm:py-2.5 text-center font-mono text-xs sm:text-sm md:text-base font-bold ${sectionTheme.analysisSubcardClass} ${sectionTheme.titleTextClass}`}
            >
              {dataType}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`md:flex-[0.85_1_0%] min-h-0 rounded-2xl border bg-white dark:bg-zinc-900 px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs flex flex-col justify-start ${sectionTheme.cardBorderClass}`}
      >
        <h3
          className={`shrink-0 text-sm sm:text-base md:text-lg font-black tracking-tight mb-2 ${sectionTheme.titleTextClass}`}
        >
          Dos preguntas para elegir la correcta
        </h3>
        <div className="my-auto flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
          {SELECTION_QUESTIONS.map((question) => (
            <div
              key={question}
              className={`flex-1 min-w-[200px] rounded-xl border px-3 py-2 text-center text-xs sm:text-sm md:text-base font-semibold text-zinc-800 dark:text-zinc-200 ${sectionTheme.analysisSubcardClass}`}
            >
              {question}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`md:flex-[1.1_1_0%] min-h-0 rounded-2xl border bg-white dark:bg-zinc-900 px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs flex flex-col justify-start ${sectionTheme.cardBorderClass}`}
      >
        <h3
          className={`shrink-0 text-sm sm:text-base md:text-lg font-black tracking-tight mb-2 ${sectionTheme.titleTextClass}`}
        >
          ¿Qué operaciones permite?
        </h3>
        <div className="my-auto grid grid-cols-1 sm:grid-cols-3 gap-2">
          {OPERATOR_GROUPS.map((group) => (
            <div
              key={group.name}
              className={`rounded-xl border px-3 py-2 flex flex-col items-center text-center gap-1.5 ${sectionTheme.analysisSubcardClass}`}
            >
              <span className={`text-xs sm:text-sm font-bold ${sectionTheme.strongTextClass}`}>
                {group.name}
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {group.examples.map((operatorSymbol) => (
                  <code
                    key={operatorSymbol}
                    className={`rounded-md border px-2 py-0.5 font-mono text-xs sm:text-sm font-bold ${sectionTheme.analysisInnerCellClass} ${sectionTheme.titleTextClass}`}
                  >
                    {operatorSymbol}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

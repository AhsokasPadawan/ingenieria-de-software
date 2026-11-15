import { SlideBlockComponentProps } from '../../core/ui/slides/defaultBlockRegistry';

const CONTROL_STRUCTURE_GROUPS = [
  {
    name: 'Condicionales',
    examples: ['if', 'else if', 'else', 'switch'],
  },
  {
    name: 'Bucles',
    examples: ['for', 'while', 'do while', 'foreach'],
  },
] as const;

const FUNCTION_ADVANTAGES = ['Modularidad', 'Reutilización', 'Legibilidad'] as const;

export function ControlStructuresFunctionsSlide({ sectionTheme }: SlideBlockComponentProps) {
  return (
    <div className="w-full h-auto md:h-full md:flex-1 flex flex-col justify-between gap-3 overflow-visible md:overflow-hidden">
      <div
        className={`md:flex-[1.1_1_0%] min-h-0 rounded-2xl border bg-white dark:bg-zinc-900 px-4 py-3.5 sm:px-5 sm:py-4 shadow-xs flex flex-col justify-start ${sectionTheme.cardBorderClass}`}
      >
        <div className="shrink-0 mb-2.5">
          <h3
            className={`text-base sm:text-lg md:text-xl font-black tracking-tight ${sectionTheme.titleTextClass}`}
          >
            Estructuras de control
          </h3>
          <p className="mt-0.5 text-xs sm:text-sm md:text-base font-medium text-zinc-700 dark:text-zinc-300">
            Permiten controlar el flujo del programa.
          </p>
        </div>

        <div className="my-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {CONTROL_STRUCTURE_GROUPS.map((group) => (
            <div
              key={group.name}
              className={`rounded-xl border px-3.5 py-2.5 sm:py-3 flex flex-col items-center text-center gap-2 ${sectionTheme.analysisSubcardClass}`}
            >
              <h4 className={`text-xs sm:text-sm md:text-base font-bold ${sectionTheme.strongTextClass}`}>
                {group.name}
              </h4>
              <div className="flex flex-wrap justify-center gap-1.5">
                {group.examples.map((keyword) => (
                  <code
                    key={keyword}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs sm:text-sm font-bold ${sectionTheme.analysisInnerCellClass} ${sectionTheme.titleTextClass}`}
                  >
                    {keyword}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`md:flex-1 min-h-0 rounded-2xl border bg-white dark:bg-zinc-900 px-4 py-3.5 sm:px-5 sm:py-4 shadow-xs flex flex-col justify-start ${sectionTheme.cardBorderClass}`}
      >
        <div className="shrink-0 mb-2.5">
          <h3
            className={`text-base sm:text-lg md:text-xl font-black tracking-tight ${sectionTheme.titleTextClass}`}
          >
            Funciones o métodos
          </h3>
          <p className="mt-0.5 text-xs sm:text-sm md:text-base font-medium text-zinc-700 dark:text-zinc-300">
            Una función es un bloque reutilizable de código. Dividir problemas grandes en partes
            pequeñas.
          </p>
        </div>

        <div className="my-auto flex flex-col gap-2">
          <span
            className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${sectionTheme.slideHeaderClass}`}
          >
            Ventajas
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {FUNCTION_ADVANTAGES.map((advantage) => (
              <div
                key={advantage}
                className={`rounded-xl border px-3 py-2.5 text-center text-xs sm:text-sm md:text-base font-bold ${sectionTheme.analysisSubcardClass} ${sectionTheme.titleTextClass}`}
              >
                {advantage}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

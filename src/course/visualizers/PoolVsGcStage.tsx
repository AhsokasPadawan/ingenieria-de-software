import { useState } from 'react';
import { Flame, Layers, Recycle, RotateCcw, Trash2 } from 'lucide-react';
import { useSectionTheme } from '../../core/domain/sectionThemes';
import {
  ALLOCATION_STRATEGY_CONFIG,
  AllocationStrategyKind,
  createInitialPoolSlots,
  GC_TRIGGER_THRESHOLD,
  HeapAllocationItem,
  PoolSlotItem,
} from './objectPoolAndMemoryData';

export function PoolVsGcStage() {
  const sectionTheme = useSectionTheme();
  const [strategy, setStrategy] = useState<AllocationStrategyKind>('pool');
  const [poolSlots, setPoolSlots] = useState<PoolSlotItem[]>(createInitialPoolSlots);
  const [overflowInUse, setOverflowInUse] = useState<number>(0);
  const [heapObjects, setHeapObjects] = useState<HeapAllocationItem[]>([]);
  const [heapAllocations, setHeapAllocations] = useState<number>(0);
  const [poolReuses, setPoolReuses] = useState<number>(0);
  const [gcCollections, setGcCollections] = useState<number>(0);
  const [nextItemId, setNextItemId] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Elegí una estrategia y dispará instancias para comparar asignaciones en Heap vs. reutilización en Pool.',
  );

  const allocateInPool = (count: number) => {
    let nextSlots = [...poolSlots];
    let reused = 0;
    let extraAllocated = 0;

    for (let i = 0; i < count; i += 1) {
      const freeIndex = nextSlots.findIndex((slot) => !slot.inUse);
      if (freeIndex !== -1) {
        const target = nextSlots[freeIndex];
        nextSlots[freeIndex] = {
          ...target,
          inUse: true,
          reuseCount: target.reuseCount + 1,
        };
        reused += 1;
      } else {
        extraAllocated += 1;
      }
    }

    setPoolSlots(nextSlots);
    setPoolReuses((previous) => previous + reused);

    if (extraAllocated > 0) {
      setOverflowInUse((previous) => previous + extraAllocated);
      setHeapAllocations((previous) => previous + extraAllocated);
      setStatusMessage(
        `Pool saturado: Get() reutilizó ${reused} y creó ${extraAllocated} instancia(s) extra en Heap.`,
      );
      return;
    }

    setStatusMessage(
      `ProjectilePool.Get(): ${reused} instancia(s) reutilizada(s) con 0 asignaciones nuevas en Heap.`,
    );
  };

  const allocateInHeap = (count: number) => {
    const incoming: HeapAllocationItem[] = Array.from({ length: count }, (_, idx) => ({
      id: nextItemId + idx,
      label: `Proj #${nextItemId + idx}`,
      generation: 'Gen 0',
    }));
    const combined = [...heapObjects, ...incoming];
    setNextItemId((previous) => previous + count);
    setHeapAllocations((previous) => previous + count);

    if (combined.length >= GC_TRIGGER_THRESHOLD) {
      setHeapObjects([]);
      setGcCollections((previous) => previous + 1);
      setStatusMessage(
        `Presión en Gen 0 alcanzó ${combined.length} objetos: el Garbage Collector pausó la ejecución para recolectar el Heap.`,
      );
      return;
    }

    setHeapObjects(combined);
    setStatusMessage(
      `new Projectile() asignó ${count} objeto(s) nuevo(s) en el Heap (${combined.length}/${GC_TRIGGER_THRESHOLD} antes de GC).`,
    );
  };

  const handleSpawn = (count: number) => {
    if (strategy === 'pool') {
      allocateInPool(count);
      return;
    }
    allocateInHeap(count);
  };

  const handleReturnAllToPool = () => {
    setPoolSlots((previous) => previous.map((slot) => ({ ...slot, inUse: false })));
    setOverflowInUse(0);
    setStatusMessage(
      'ProjectilePool.Return(): todas las instancias volvieron a estado disponible (IsActive = false) sin pasar por el GC.',
    );
  };

  const handleManualGc = () => {
    if (heapObjects.length === 0) {
      setStatusMessage('El Heap Gen 0 ya está vacío; no hay objetos temporales para recolectar.');
      return;
    }
    const collected = heapObjects.length;
    setHeapObjects([]);
    setGcCollections((previous) => previous + 1);
    setStatusMessage(
      `GC.Collect() liberó ${collected} objeto(s) no alcanzables del Heap. Evitar invocaciones manuales en el hot path.`,
    );
  };

  const handleReset = () => {
    setPoolSlots(createInitialPoolSlots());
    setOverflowInUse(0);
    setHeapObjects([]);
    setHeapAllocations(0);
    setPoolReuses(0);
    setGcCollections(0);
    setNextItemId(1);
    setStatusMessage('Simulador reiniciado.');
  };

  const heapPressurePercent = Math.min(
    100,
    Math.round((heapObjects.length / GC_TRIGGER_THRESHOLD) * 100),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['pool', 'heap'] as const).map((optionKey) => {
            const isSelected = strategy === optionKey;
            return (
              <button
                key={optionKey}
                type="button"
                onClick={() => setStrategy(optionKey)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                  isSelected
                    ? sectionTheme.primaryButtonClass
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {ALLOCATION_STRATEGY_CONFIG[optionKey].label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSpawn(1)}
            className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>{strategy === 'pool' ? 'Get() ×1' : 'new ×1'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSpawn(5)}
            className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Ráfaga ×5</span>
          </button>
          {strategy === 'pool' ? (
            <button
              type="button"
              onClick={handleReturnAllToPool}
              className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25"
            >
              <Recycle className="h-3.5 w-3.5" />
              <span>Return() todos</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleManualGc}
              className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-500/25"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Simular GC</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-300">
              Object Pool (Capacidad pre-asignada: {poolSlots.length})
            </span>
            {overflowInUse > 0 && (
              <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-300">
                +{overflowInUse} overflow en Heap
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {poolSlots.map((slot) => (
              <div
                key={slot.id}
                className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition ${
                  slot.inUse
                    ? 'border-amber-500/60 bg-amber-500/15 text-amber-200'
                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                }`}
              >
                <span className="font-mono text-xs font-bold">Slot #{slot.id}</span>
                <span className="text-[10px] font-semibold">
                  {slot.inUse ? 'En uso' : 'Disponible'}
                </span>
                <span className="text-[10px] text-zinc-400">usos: {slot.reuseCount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-zinc-300">
                Heap Gen 0 (Objetos sin Pool)
              </span>
              <span className="font-mono text-xs font-bold text-amber-300">
                {heapObjects.length} / {GC_TRIGGER_THRESHOLD}
              </span>
            </div>
            <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full transition-all ${
                  heapPressurePercent >= 75 ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${heapPressurePercent}%` }}
              />
            </div>
            <div className="flex min-h-[84px] flex-wrap content-start gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-2">
              {heapObjects.length === 0 ? (
                <span className="text-xs text-zinc-500">
                  Heap Gen 0 limpio (sin objetos temporales pendientes de GC).
                </span>
              ) : (
                heapObjects.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-md border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-rose-200"
                  >
                    {item.label}
                  </span>
                ))
              )}
            </div>
          </div>

          <p className="mt-2 text-xs text-zinc-400">
            {ALLOCATION_STRATEGY_CONFIG[strategy].description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
          <div className="text-[11px] font-bold uppercase text-zinc-400">
            Asignaciones en Heap
          </div>
          <div className="font-mono text-lg font-black text-rose-300">{heapAllocations}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
          <div className="text-[11px] font-bold uppercase text-zinc-400">
            Reutilizados del Pool
          </div>
          <div className="font-mono text-lg font-black text-emerald-300">{poolReuses}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
          <div className="text-[11px] font-bold uppercase text-zinc-400">
            Pausas de GC (Gen 0)
          </div>
          <div className="font-mono text-lg font-black text-amber-300">{gcCollections}</div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-2 font-mono text-xs text-zinc-200">
        {statusMessage}
      </div>
    </div>
  );
}

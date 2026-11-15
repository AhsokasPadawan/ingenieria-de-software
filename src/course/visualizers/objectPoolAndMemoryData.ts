export type MemoryVisualizerTabKind = 'pool-vs-gc' | 'leak-dispose';

export type AllocationStrategyKind = 'pool' | 'heap';

export interface PoolSlotItem {
  id: number;
  inUse: boolean;
  reuseCount: number;
}

export interface HeapAllocationItem {
  id: number;
  label: string;
  generation: 'Gen 0' | 'Gen 1';
}

export interface SubscriberInstance {
  id: number;
  label: string;
  implementsDispose: boolean;
  callerHoldsReference: boolean;
  subscribedToEmitter: boolean;
  eventsHandled: number;
  collectedByGc: boolean;
}

export const INITIAL_POOL_CAPACITY = 8;
export const GC_TRIGGER_THRESHOLD = 8;

export const MEMORY_TAB_CONFIG: Record<
  MemoryVisualizerTabKind,
  { label: string; title: string; footer: string }
> = {
  'pool-vs-gc': {
    label: 'Object Pool vs. Heap/GC',
    title: 'Simulador de Object Pool (Get / Return) vs. Presión de GC en Heap',
    footer:
      'Object Pooling pre-asigna y reutiliza instancias en el hot path: evita crear basura temporal en el Heap y reduce las pausas del Garbage Collector.',
  },
  'leak-dispose': {
    label: 'Memory Leak & Dispose()',
    title: 'Simulador de Memory Leak por Eventos sin IDisposable.Dispose()',
    footer:
      'En C#, suscribirse a un evento sin desuscribirse en Dispose() mantiene una referencia viva desde el EventEmitter: el GC no puede liberar el objeto aunque nadie más lo use.',
  },
};

export const ALLOCATION_STRATEGY_CONFIG: Record<
  AllocationStrategyKind,
  { label: string; badge: string; description: string }
> = {
  pool: {
    label: 'Con Object Pool (Get / Return)',
    badge: 'ProjectilePool',
    description:
      'Reutiliza instancias pre-asignadas. Solo asigna en Heap si se supera la capacidad inicial del pool.',
  },
  heap: {
    label: 'Sin Pool (new Projectile en Heap)',
    badge: 'new Projectile()',
    description:
      'Cada disparo crea un objeto nuevo en Gen 0 del Heap. Al llenarse, el Garbage Collector debe pausar para recolectar.',
  },
};

export function createInitialPoolSlots(): PoolSlotItem[] {
  return Array.from({ length: INITIAL_POOL_CAPACITY }, (_, index) => ({
    id: index + 1,
    inUse: false,
    reuseCount: 0,
  }));
}

export const INITIAL_SUBSCRIBERS: readonly SubscriberInstance[] = [
  {
    id: 1,
    label: 'LeakySubscriber #1',
    implementsDispose: false,
    callerHoldsReference: true,
    subscribedToEmitter: true,
    eventsHandled: 1,
    collectedByGc: false,
  },
  {
    id: 2,
    label: 'FixedSubscriber #2',
    implementsDispose: true,
    callerHoldsReference: true,
    subscribedToEmitter: true,
    eventsHandled: 1,
    collectedByGc: false,
  },
];

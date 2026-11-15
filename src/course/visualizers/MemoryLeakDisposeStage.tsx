import { useState } from 'react';
import { BellRing, Plus, RotateCcw, ShieldCheck, Trash2, Unlink } from 'lucide-react';
import { INITIAL_SUBSCRIBERS, SubscriberInstance } from './objectPoolAndMemoryData';

export function MemoryLeakDisposeStage() {
  const [subscribers, setSubscribers] = useState<readonly SubscriberInstance[]>(
    INITIAL_SUBSCRIBERS,
  );
  const [nextId, setNextId] = useState<number>(3);
  const [emittedCount, setEmittedCount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Compará qué ocurre al soltar la referencia del caller según si el suscriptor implementa Dispose() o no.',
  );

  const handleAddSubscriber = (implementsDispose: boolean) => {
    const newItem: SubscriberInstance = {
      id: nextId,
      label: implementsDispose
        ? `FixedSubscriber #${nextId}`
        : `LeakySubscriber #${nextId}`,
      implementsDispose,
      callerHoldsReference: true,
      subscribedToEmitter: true,
      eventsHandled: 0,
      collectedByGc: false,
    };
    setSubscribers((previous) => [...previous, newItem]);
    setNextId((previous) => previous + 1);
    setStatusMessage(
      `Suscripto ${newItem.label} a EventEmitter.OnSomethingHappened.`,
    );
  };

  const handleEmitEvent = () => {
    setEmittedCount((previous) => previous + 1);
    let activeHandlers = 0;
    setSubscribers((previous) =>
      previous.map((item) => {
        if (!item.collectedByGc && item.subscribedToEmitter) {
          activeHandlers += 1;
          return { ...item, eventsHandled: item.eventsHandled + 1 };
        }
        return item;
      }),
    );
    setStatusMessage(
      `EventEmitter disparó OnSomethingHappened: ${activeHandlers} delegado(s) respondieron en memoria.`,
    );
  };

  const handleReleaseCallerAndMaybeDispose = (targetId: number) => {
    const target = subscribers.find((item) => item.id === targetId);
    if (!target) return;

    setSubscribers((previous) =>
      previous.map((item) =>
        item.id === targetId
          ? {
              ...item,
              callerHoldsReference: false,
              subscribedToEmitter: item.implementsDispose ? false : item.subscribedToEmitter,
            }
          : item,
      ),
    );

    if (target.implementsDispose) {
      setStatusMessage(
        `${target.label}.Dispose() ejecutado: se desuscribió del EventEmitter y perdió toda referencia.`,
      );
      return;
    }

    setStatusMessage(
      `Caller soltó ${target.label}, pero NO tiene Dispose(): EventEmitter sigue reteniendo su referencia.`,
    );
  };

  const handleRunGc = () => {
    let freed = 0;
    let leaked = 0;

    setSubscribers((previous) =>
      previous.map((item) => {
        if (item.collectedByGc) return item;
        const isReachable = item.callerHoldsReference || item.subscribedToEmitter;
        if (!isReachable) {
          freed += 1;
          return { ...item, collectedByGc: true };
        }
        if (!item.callerHoldsReference && item.subscribedToEmitter) {
          leaked += 1;
        }
        return item;
      }),
    );

    setStatusMessage(
      `GC ejecutado: ${freed} instancia(s) liberada(s). ${leaked} instancia(s) retenida(s) como Memory Leak por EventEmitter.`,
    );
  };

  const handleReset = () => {
    setSubscribers(INITIAL_SUBSCRIBERS);
    setNextId(3);
    setEmittedCount(0);
    setStatusMessage('Escenario de EventEmitter y suscriptores reiniciado.');
  };

  const activeInHeap = subscribers.filter((item) => !item.collectedByGc).length;
  const leakedCount = subscribers.filter(
    (item) => !item.collectedByGc && !item.callerHoldsReference && item.subscribedToEmitter,
  ).length;
  const freedCount = subscribers.filter((item) => item.collectedByGc).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleAddSubscriber(false)}
            className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-500/25"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Suscribir sin Dispose()</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddSubscriber(true)}
            className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Suscribir con IDisposable</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleEmitEvent}
            className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25"
          >
            <BellRing className="h-3.5 w-3.5" />
            <span>Emitir Evento ({emittedCount})</span>
          </button>
          <button
            type="button"
            onClick={handleRunGc}
            className="flex items-center gap-1 rounded-lg border border-sky-500/40 bg-sky-500/15 px-2.5 py-1.5 text-xs font-bold text-sky-200 hover:bg-sky-500/25"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Ejecutar GC</span>
          </button>
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {subscribers.map((item) => {
          const isLeak =
            !item.collectedByGc && !item.callerHoldsReference && item.subscribedToEmitter;

          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between gap-2 rounded-xl border p-3 transition ${
                item.collectedByGc
                  ? 'border-zinc-800 bg-zinc-950/50 opacity-50'
                  : isLeak
                    ? 'border-rose-500/60 bg-rose-950/30'
                    : 'border-zinc-700 bg-zinc-900/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-zinc-100">{item.label}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                    item.collectedByGc
                      ? 'bg-zinc-800 text-zinc-400'
                      : isLeak
                        ? 'bg-rose-500/25 text-rose-200'
                        : item.implementsDispose
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-amber-500/20 text-amber-200'
                  }`}
                >
                  {item.collectedByGc
                    ? 'Liberado por GC'
                    : isLeak
                      ? 'Memory Leak'
                      : item.implementsDispose
                        ? 'IDisposable'
                        : 'Sin Dispose'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span
                  className={`rounded border px-1.5 py-0.5 ${
                    item.callerHoldsReference
                      ? 'border-sky-500/40 bg-sky-500/10 text-sky-200'
                      : 'border-zinc-700 bg-zinc-950 text-zinc-500'
                  }`}
                >
                  Caller: {item.callerHoldsReference ? 'Vivo' : 'Soltado'}
                </span>
                <span
                  className={`rounded border px-1.5 py-0.5 ${
                    item.subscribedToEmitter
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  }`}
                >
                  EventEmitter: {item.subscribedToEmitter ? 'Retenido' : 'Desuscripto'}
                </span>
                <span className="rounded border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 font-mono text-zinc-300">
                  eventos: {item.eventsHandled}
                </span>
              </div>

              {!item.collectedByGc && item.callerHoldsReference && (
                <button
                  type="button"
                  onClick={() => handleReleaseCallerAndMaybeDispose(item.id)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs font-bold text-zinc-200 hover:bg-zinc-800"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  <span>
                    {item.implementsDispose
                      ? 'Llamar Dispose() y soltar'
                      : 'Soltar referencia sin Dispose()'}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
          <div className="text-[11px] font-bold uppercase text-zinc-400">Vivos en Heap</div>
          <div className="font-mono text-lg font-black text-amber-300">{activeInHeap}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
          <div className="text-[11px] font-bold uppercase text-zinc-400">
            Memory Leaks (Retenidos)
          </div>
          <div className="font-mono text-lg font-black text-rose-300">{leakedCount}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
          <div className="text-[11px] font-bold uppercase text-zinc-400">Liberados por GC</div>
          <div className="font-mono text-lg font-black text-emerald-300">{freedCount}</div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-2 font-mono text-xs text-zinc-200">
        {statusMessage}
      </div>
    </div>
  );
}

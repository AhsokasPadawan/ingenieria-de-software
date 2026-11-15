import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Link2Off,
  Plus,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  APPEND_ACTION_PRESETS,
  AUDIT_SECRET_KEY,
  AuditEntryRecord,
  computeHmacSha256Hex,
  evaluateAuditChain,
  formatEntryPayload,
  GENESIS_MAC,
  INITIAL_ANCHORED_TAIL_MAC,
  INITIAL_AUDIT_ENTRIES,
} from './hmacAuditChainData';
import { InteractiveVisualizerShell } from './shared/InteractiveVisualizerShell';

function shortenHex(hex: string): string {
  if (hex === GENESIS_MAC) return GENESIS_MAC;
  if (hex.length <= 16) return hex;
  return `${hex.slice(0, 10)}…${hex.slice(-6)}`;
}

export function HmacAuditChainVisualizer() {
  const [entries, setEntries] = useState<readonly AuditEntryRecord[]>(INITIAL_AUDIT_ENTRIES);
  const [anchoredTailMac, setAnchoredTailMac] = useState<string>(INITIAL_ANCHORED_TAIL_MAC);
  const [nextAppendIndex, setNextAppendIndex] = useState<number>(INITIAL_AUDIT_ENTRIES.length);
  const [presetCursor, setPresetCursor] = useState<number>(0);

  const chainEvaluation = evaluateAuditChain(entries);
  const isTailTruncated =
    chainEvaluation.firstBrokenIndex === -1 &&
    chainEvaluation.currentTailMac !== anchoredTailMac;

  const handleFieldEdit = async (
    targetIndex: number,
    field: 'actor' | 'action',
    value: string,
  ) => {
    const target = entries.find((item) => item.index === targetIndex);
    if (!target) return;

    const updatedActor = field === 'actor' ? value : target.actor;
    const updatedAction = field === 'action' ? value : target.action;
    const payload = formatEntryPayload(
      target.index,
      updatedActor,
      updatedAction,
      target.prevMac,
    );
    const recomputedMac = await computeHmacSha256Hex(AUDIT_SECRET_KEY, payload);

    setEntries((previous) =>
      previous.map((item) =>
        item.index === targetIndex
          ? {
              ...item,
              actor: updatedActor,
              action: updatedAction,
              recomputedMac,
            }
          : item,
      ),
    );
  };

  const handleDeleteEntry = (targetIndex: number) => {
    setEntries((previous) => previous.filter((item) => item.index !== targetIndex));
  };

  const handleAppendEntry = async () => {
    const preset = APPEND_ACTION_PRESETS[presetCursor % APPEND_ACTION_PRESETS.length];
    const prevMac =
      entries.length > 0 ? entries[entries.length - 1].mac : GENESIS_MAC;
    const index = nextAppendIndex;
    const payload = formatEntryPayload(index, preset.actor, preset.action, prevMac);
    const mac = await computeHmacSha256Hex(AUDIT_SECRET_KEY, payload);

    const newEntry: AuditEntryRecord = {
      index,
      actor: preset.actor,
      action: preset.action,
      prevMac,
      mac,
      recomputedMac: mac,
    };

    setEntries((previous) => [...previous, newEntry]);
    setNextAppendIndex((previous) => previous + 1);
    setPresetCursor((previous) => previous + 1);
    if (chainEvaluation.firstBrokenIndex === -1 && !isTailTruncated) {
      setAnchoredTailMac(mac);
    }
  };

  const handleRestoreChain = () => {
    setEntries(INITIAL_AUDIT_ENTRIES);
    setAnchoredTailMac(INITIAL_ANCHORED_TAIL_MAC);
    setNextAppendIndex(INITIAL_AUDIT_ENTRIES.length);
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={handleAppendEntry}
        className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-xs font-bold text-rose-100 hover:bg-rose-500/25"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>append()</span>
      </button>
      <button
        type="button"
        onClick={handleRestoreChain}
        className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Restaurar cadena</span>
      </button>
    </div>
  );

  return (
    <InteractiveVisualizerShell
      title="Cadena de Auditoría AuditLog (HmacSHA256) y firstBrokenEntry()"
      badge="Unidad 6 · Integridad"
      headerActions={headerActions}
      footerBanner="Editar un campo altera su HMAC (authentic = false); borrar una entrada intermedia rompe el enlace siguiente (linked = false); borrar las últimas no rompe la cadena interna (Límite 3)."
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
            <div className="text-[10px] font-bold uppercase text-zinc-400">
              firstBrokenEntry()
            </div>
            <div
              className={`mt-0.5 flex items-center gap-1.5 font-mono text-base font-black ${
                chainEvaluation.firstBrokenIndex === -1
                  ? 'text-emerald-300'
                  : 'text-rose-300'
              }`}
            >
              {chainEvaluation.firstBrokenIndex === -1 ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <ShieldAlert className="h-4 w-4 shrink-0" />
              )}
              <span>
                {chainEvaluation.firstBrokenIndex === -1
                  ? '-1 (Cadena íntegra)'
                  : `Índice ${chainEvaluation.firstBrokenIndex}`}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
            <div className="text-[10px] font-bold uppercase text-zinc-400">
              Último MAC resguardado (Externo)
            </div>
            <div className="mt-0.5 font-mono text-xs font-bold text-zinc-200">
              {shortenHex(anchoredTailMac)}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2.5">
            <div className="text-[10px] font-bold uppercase text-zinc-400">
              Último MAC actual en AuditLog
            </div>
            <div
              className={`mt-0.5 font-mono text-xs font-bold ${
                isTailTruncated ? 'text-amber-300' : 'text-zinc-200'
              }`}
            >
              {shortenHex(chainEvaluation.currentTailMac)}
            </div>
          </div>
        </div>

        {isTailTruncated && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/50 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <span className="font-bold">Límite 3 detectado: </span>
              <span>
                firstBrokenEntry() devolvió -1 porque los enlaces internos siguen siendo válidos tras borrar el final, pero el último MAC actual no coincide con el último MAC resguardado externamente.
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {entries.length === 0 ? (
            <div className="col-span-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center text-xs text-zinc-400">
              La lista entries está vacía. Usá append() o Restaurar cadena para reconstruir el registro.
            </div>
          ) : (
            entries.map((entry) => {
              const diag = chainEvaluation.diagnosticsByIndex[entry.index];
              const isBroken = diag?.isFirstBroken;
              const isAfter = diag?.isAfterBreak;

              return (
                <div
                  key={entry.index}
                  className={`flex flex-col gap-1.5 rounded-xl border p-2 transition ${
                    isBroken
                      ? 'border-rose-500 bg-rose-950/35 ring-1 ring-rose-500/50'
                      : isAfter
                        ? 'border-amber-600/50 bg-amber-950/20'
                        : 'border-emerald-700/50 bg-zinc-900/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs font-bold text-zinc-100">
                        Entry #{entry.index}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                          diag?.linked
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'bg-rose-500/25 text-rose-200'
                        }`}
                      >
                        {diag?.linked ? 'linked = true' : 'linked = false (prevMac roto)'}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                          diag?.authentic
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'bg-rose-500/25 text-rose-200'
                        }`}
                      >
                        {diag?.authentic ? 'authentic = true' : 'authentic = false (MAC inválido)'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry.index)}
                      className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] font-bold text-rose-200 hover:bg-rose-500/25"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Borrar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="flex flex-col gap-0.5 text-[11px]">
                      <span className="font-bold text-zinc-400">actor (editable para simular alteración)</span>
                      <input
                        type="text"
                        value={entry.actor}
                        onChange={(event) =>
                          void handleFieldEdit(entry.index, 'actor', event.target.value)
                        }
                        className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-100 focus:border-rose-400 focus:outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-0.5 text-[11px]">
                      <span className="font-bold text-zinc-400">action (editable para simular alteración)</span>
                      <input
                        type="text"
                        value={entry.action}
                        onChange={(event) =>
                          void handleFieldEdit(entry.index, 'action', event.target.value)
                        }
                        className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-100 focus:border-rose-400 focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-950/70 p-2 font-mono text-[10px] sm:grid-cols-2">
                    <div className="flex items-center gap-1 text-zinc-400">
                      {!diag?.linked && <Link2Off className="h-3 w-3 shrink-0 text-rose-400" />}
                      <span className="truncate">prevMac: {shortenHex(entry.prevMac)}</span>
                    </div>
                    <div className="truncate text-zinc-300">
                      mac guardado: {shortenHex(entry.mac)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </InteractiveVisualizerShell>
  );
}

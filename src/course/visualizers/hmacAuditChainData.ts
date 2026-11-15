export interface AuditEntryRecord {
  index: number;
  actor: string;
  action: string;
  prevMac: string;
  mac: string;
  recomputedMac: string;
}

export interface AuditEntryDiagnostic {
  index: number;
  linked: boolean;
  authentic: boolean;
  isFirstBroken: boolean;
  isAfterBreak: boolean;
}

export const AUDIT_SECRET_KEY = 'UADE-IngSoft-2026';
export const GENESIS_MAC = 'GENESIS';

export const INITIAL_AUDIT_ENTRIES: readonly AuditEntryRecord[] = [
  {
    index: 0,
    actor: 'ana.silva',
    action: 'LOGIN_OK',
    prevMac: 'GENESIS',
    mac: 'd5d51c642749706ea8ae062c23a0f3e8212cf37d7a7df15ab7976625618f7884',
    recomputedMac: 'd5d51c642749706ea8ae062c23a0f3e8212cf37d7a7df15ab7976625618f7884',
  },
  {
    index: 1,
    actor: 'carlos.ruiz',
    action: 'DEPLOY_PROD_v2.4',
    prevMac: 'd5d51c642749706ea8ae062c23a0f3e8212cf37d7a7df15ab7976625618f7884',
    mac: '55862251efa41327ee249f0f5170b57d79c0663199b685184a4b5f3e85144ec5',
    recomputedMac: '55862251efa41327ee249f0f5170b57d79c0663199b685184a4b5f3e85144ec5',
  },
  {
    index: 2,
    actor: 'ana.silva',
    action: 'UPDATE_SLA_POLICY',
    prevMac: '55862251efa41327ee249f0f5170b57d79c0663199b685184a4b5f3e85144ec5',
    mac: '44aed7204f6044d777b13fdb9b8c092a66597bee78b0756bcf8f0b4230fc442d',
    recomputedMac: '44aed7204f6044d777b13fdb9b8c092a66597bee78b0756bcf8f0b4230fc442d',
  },
  {
    index: 3,
    actor: 'audit.bot',
    action: 'EXPORT_EVIDENCE',
    prevMac: '44aed7204f6044d777b13fdb9b8c092a66597bee78b0756bcf8f0b4230fc442d',
    mac: '80f600e93589cf4743917441dfff5538d15224eb04bf7a53c4ff01fe6f92b56c',
    recomputedMac: '80f600e93589cf4743917441dfff5538d15224eb04bf7a53c4ff01fe6f92b56c',
  },
];

export const INITIAL_ANCHORED_TAIL_MAC =
  INITIAL_AUDIT_ENTRIES[INITIAL_AUDIT_ENTRIES.length - 1].mac;

export const APPEND_ACTION_PRESETS: readonly { actor: string; action: string }[] = [
  { actor: 'm.gomez', action: 'APPROVE_PR_418' },
  { actor: 'ci.runner', action: 'SIGN_SBOM_SHA256' },
  { actor: 'sec.lead', action: 'ROTATE_HMAC_KEY' },
];

export function formatEntryPayload(
  index: number,
  actor: string,
  action: string,
  prevMac: string,
): string {
  return `${index}|${actor}|${action}|${prevMac}`;
}

function fallbackDeterministicHex(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  const partA = (h1 >>> 0).toString(16).padStart(8, '0');
  const partB = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${partA}${partB}`.repeat(4);
}

export async function computeHmacSha256Hex(
  secretKey: string,
  payload: string,
): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    return fallbackDeterministicHex(`${secretKey}|${payload}`);
  }
  const encoder = new TextEncoder();
  const key = await subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function evaluateAuditChain(entries: readonly AuditEntryRecord[]): {
  firstBrokenIndex: number;
  diagnosticsByIndex: Record<number, AuditEntryDiagnostic>;
  currentTailMac: string;
} {
  let expectedPrev = GENESIS_MAC;
  let firstBrokenIndex = -1;
  const diagnosticsByIndex: Record<number, AuditEntryDiagnostic> = {};

  for (const entry of entries) {
    const linked = entry.prevMac === expectedPrev;
    const authentic = entry.mac === entry.recomputedMac;
    const isBrokenHere = !linked || !authentic;
    const isFirstBroken = firstBrokenIndex === -1 && isBrokenHere;
    if (isFirstBroken) {
      firstBrokenIndex = entry.index;
    }
    diagnosticsByIndex[entry.index] = {
      index: entry.index,
      linked,
      authentic,
      isFirstBroken,
      isAfterBreak: firstBrokenIndex !== -1 && !isFirstBroken,
    };
    expectedPrev = entry.mac;
  }

  return {
    firstBrokenIndex,
    diagnosticsByIndex,
    currentTailMac: entries.length > 0 ? entries[entries.length - 1].mac : GENESIS_MAC,
  };
}

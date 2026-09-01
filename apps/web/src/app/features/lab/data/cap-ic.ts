import {
  AnalysisMode,
  SchematicDocument,
  assignNets
} from './schematic.model';
import { SimulateResponse } from '../api/circuit-api.types';
import { energyTopologyFingerprint } from './circuit-topology';
import { allEnergyPathsOpen } from './switch-state';

export { energyTopologyFingerprint, schematicCapFingerprint } from './circuit-topology';
export { allEnergyPathsOpen, allSwitchesOpen } from './switch-state';

function stableParams(params: Record<string, unknown>): string {
  const keys = Object.keys(params).sort();
  return keys.map((k) => `${k}=${JSON.stringify(params[k])}`).join(';');
}

/**
 * Fingerprint for auto-sim — topology, params, and analysis settings.
 * Ignores canvas x/y so dragging parts does not re-solve.
 */
export function electricalSimKey(
  doc: SchematicDocument,
  mode: AnalysisMode,
  tStop: number,
  dt: number,
  acFreq: number,
  initFromDc: boolean
): string {
  const comps = [...doc.components]
    .map((c) => `${c.id}:${c.modelKey}:${c.rotation}:${stableParams(c.params)}`)
    .sort()
    .join('|');
  const wires = [...doc.wires]
    .map((w) => `${w.a.componentId}.${w.a.pin}-${w.b.componentId}.${w.b.pin}`)
    .sort()
    .join('|');
  return `${comps}::${wires}::${mode}:${tStop}:${dt}:${acFreq}:${initFromDc}`;
}

/** Final V(a)−V(b) per capacitor from the last transient sample. */
export function finalCapVoltagesFromTran(
  doc: SchematicDocument,
  res: SimulateResponse
): Map<string, number> {
  const out = new Map<string, number>();
  const tran = res.tran;
  if (!tran?.time?.length) return out;
  const nettled = assignNets(doc);
  const last = tran.time.length - 1;
  const vOf = (net: string): number | null => {
    if (net === nettled.groundNet) return 0;
    const s = tran.nodeVoltages.find((x) => x.id === net);
    const v = s?.values[last];
    return typeof v === 'number' ? v : null;
  };
  for (const c of nettled.components) {
    if (c.modelKey !== 'capacitor') continue;
    const na = c.pins['a']?.net;
    const nb = c.pins['b']?.net;
    if (!na || !nb) continue;
    const va = vOf(na);
    const vb = vOf(nb);
    if (va === null || vb === null) continue;
    out.set(c.id, va - vb);
  }
  return out;
}

export function maxStoredCapVoltageAbs(stored: Map<string, number>): number {
  let best = 0;
  for (const v of stored.values()) {
    const abs = Math.abs(v);
    if (abs > best) best = abs;
  }
  return best;
}

/** Whether stored energy should drive discharge fade playback for this schematic. */
export function shouldAnimateCapDischarge(
  doc: SchematicDocument,
  usedEnergySeed: boolean
): boolean {
  return usedEnergySeed && allEnergyPathsOpen(doc);
}

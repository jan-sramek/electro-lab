import { SimulateResponse, TranResult } from '../api/circuit-api.types';
import { SchematicComponent, SchematicDocument, assignNets, paramNumber } from './schematic.model';

/** Node voltage series; ground is always 0 V even when omitted from engine output. */
export function tranNetVoltageSeries(
  tran: TranResult,
  net: string,
  groundNet: string
): number[] | null {
  if (net === groundNet) return tran.time.map(() => 0);
  const s = tran.nodeVoltages.find((x) => x.id === net);
  return s?.values?.length ? s.values : null;
}

/**
 * Capacitor branch current from Vc(t) when the engine reports ~0 (common with BE at t=0
 * or when the companion stamp under-reports in parallel RC+load topologies).
 * I = C · d(Va−Vb)/dt using the transient node voltages.
 */
export function capCurrentFromTranVoltage(
  doc: SchematicDocument,
  cap: SchematicComponent,
  res: SimulateResponse,
  idx: number
): number | null {
  const tran = res.tran;
  if (!tran?.time?.length) return null;

  const cVal = paramNumber(cap.params, 'c', 0);
  if (!(cVal > 0)) return null;

  const nettled = assignNets(doc);
  const c = nettled.components.find((x) => x.id === cap.id);
  if (!c) return null;

  const na = c.pins['a']?.net;
  const nb = c.pins['b']?.net;
  if (!na || !nb) return null;

  const va = tranNetVoltageSeries(tran, na, nettled.groundNet);
  const vb = tranNetVoltageSeries(tran, nb, nettled.groundNet);
  if (!va?.length || !vb?.length) return null;

  const capped = Math.max(0, Math.min(idx, va.length - 1, vb.length - 1, tran.time.length - 1));
  const i = capped < 1 ? 1 : capped;
  const prev = i - 1;
  const dt = (tran.time[i] ?? 0) - (tran.time[prev] ?? 0);
  if (!(dt > 0)) return null;

  const vNow = (va[i] ?? 0) - (vb[i] ?? 0);
  const vPrev = (va[prev] ?? 0) - (vb[prev] ?? 0);
  return cVal * (vNow - vPrev) / dt;
}

/**
 * Teaching idle floor (~0.01 mA). Below this, labels and wire-flow treat the branch as off.
 * Large C with C·dV/dt otherwise turns tiny voltage noise into a lasting ghost current.
 */
export const CAP_CURRENT_IDLE_A = 1e-5;

/** Prefer simulated I; fall back to C·dV/dt when the reported branch I is negligible. */
export function resolveCapacitorBranchCurrent(
  doc: SchematicDocument,
  capId: string,
  res: SimulateResponse | null | undefined,
  scrubIndex: number,
  reported: number | null | undefined
): number | null {
  if (typeof reported === 'number' && Math.abs(reported) > CAP_CURRENT_IDLE_A) return reported;
  if (!res?.tran?.time?.length) {
    if (typeof reported === 'number' && Math.abs(reported) <= CAP_CURRENT_IDLE_A) return 0;
    return typeof reported === 'number' ? reported : null;
  }

  const cap = doc.components.find((c) => c.id === capId && c.modelKey === 'capacitor');
  if (!cap) {
    if (typeof reported === 'number' && Math.abs(reported) <= CAP_CURRENT_IDLE_A) return 0;
    return typeof reported === 'number' ? reported : null;
  }

  const idx = Math.max(0, Math.min(scrubIndex, res.tran.time.length - 1));
  const fromV = capCurrentFromTranVoltage(doc, cap, res, idx);
  if (fromV !== null && Math.abs(fromV) > CAP_CURRENT_IDLE_A) return fromV;

  if (typeof reported === 'number') return Math.abs(reported) <= CAP_CURRENT_IDLE_A ? 0 : reported;
  return 0;
}

/** Effective |I| at a transient sample (sim branch I or C·dV/dt). */
export function effectiveCapCurrentAtIndex(
  doc: SchematicDocument,
  tran: NonNullable<SimulateResponse['tran']>,
  capId: string,
  idx: number
): number | null {
  const series = tran.branchCurrents.find((s) => s.id === capId);
  const reported = series?.values[idx];
  return resolveCapacitorBranchCurrent(doc, capId, { tran } as SimulateResponse, idx, reported);
}

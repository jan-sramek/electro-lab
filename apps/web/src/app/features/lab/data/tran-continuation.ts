import { SchematicDocument, assignNets, compileNetlist, paramNumber } from './schematic.model';
import { SimulateResponse, TranResult, TranSeries } from '../api/circuit-api.types';

export type CompiledCircuit = ReturnType<typeof compileNetlist>;

/** Must match CircuitEngine transient step cap. */
export const TRAN_MAX_STEPS = 20_000;

/** Safety cap on chained API segments per Run. */
export const TRAN_MAX_SEGMENTS = 50;

export interface TranEnergyState {
  caps: Map<string, number>;
  inductors: Map<string, number>;
}

export function maxSegmentTStop(dt: number): number {
  return TRAN_MAX_STEPS * dt;
}

/**
 * Dominant RC or L/R time constant (seconds) from schematic values.
 * Uses summed R with LED/diode teaching drops — same heuristic as settling estimate.
 */
export function estimateDominantTau(doc: SchematicDocument): number | null {
  let totalR = 0;
  let maxC = 0;
  let maxL = 0;
  for (const c of doc.components) {
    if (c.modelKey === 'resistor') totalR += paramNumber(c.params, 'r', 0);
    if (c.modelKey === 'capacitor') maxC = Math.max(maxC, paramNumber(c.params, 'c', 0));
    if (c.modelKey === 'inductor') maxL = Math.max(maxL, paramNumber(c.params, 'l', 0));
    if (c.modelKey === 'led' || c.modelKey === 'diode') totalR += 20;
  }
  totalR = Math.max(totalR, 1);

  let maxTau = 0;
  if (maxC > 0) maxTau = Math.max(maxTau, totalR * maxC);
  if (maxL > 0) maxTau = Math.max(maxTau, maxL / totalR);
  return maxTau > 0 ? maxTau : null;
}

/** Charge / general RC settling (~99% at 5τ). */
export const CHARGE_SETTLING_TAU_MULT = 5;

/** Open-switch discharge — run longer so labels and LED reach ~0 mA. */
export const DISCHARGE_SETTLING_TAU_MULT = 8;

/**
 * Teaching estimate of time to reach ~99% settling (5τ) from largest RC / L/R in the schematic.
 * Returns null when no energy-storage parts are present.
 */
export function estimateSettlingTStop(doc: SchematicDocument, dt: number): number | null {
  if (!(dt > 0)) return null;
  const tau = estimateDominantTau(doc);
  if (tau === null) return null;
  const maxReach = maxSegmentTStop(dt) * TRAN_MAX_SEGMENTS;
  return Math.min(CHARGE_SETTLING_TAU_MULT * tau, maxReach);
}

/** Discharge needs more time constants so canvas current and LED brightness reach ~0. */
export function estimateDischargeSettlingTStop(doc: SchematicDocument, dt: number): number | null {
  if (!(dt > 0)) return null;
  const tau = estimateDominantTau(doc);
  if (tau === null) return null;
  const maxReach = maxSegmentTStop(dt) * TRAN_MAX_SEGMENTS;
  return Math.min(DISCHARGE_SETTLING_TAU_MULT * tau, maxReach);
}

/** Total simulated time: honor toolbar tStop but extend when storage parts need longer to settle. */
export function effectiveTargetTStop(
  doc: SchematicDocument,
  userTStop: number,
  dt: number
): number {
  const settling = estimateSettlingTStop(doc, dt);
  const maxReach = maxSegmentTStop(dt) * TRAN_MAX_SEGMENTS;
  const target = settling !== null ? Math.max(userTStop, settling) : userTStop;
  return Math.min(Math.max(target, dt), maxReach);
}

/** Split a target duration into engine-sized segments. */
export function planTranSegments(targetTStop: number, dt: number): number[] {
  const segMax = maxSegmentTStop(dt);
  const segments: number[] = [];
  let remaining = targetTStop;
  while (remaining > dt * 0.5 && segments.length < TRAN_MAX_SEGMENTS) {
    const seg = Math.min(remaining, segMax);
    segments.push(seg);
    remaining -= seg;
  }
  return segments.length ? segments : [Math.min(targetTStop, segMax)];
}

export function extractEnergyState(doc: SchematicDocument, res: SimulateResponse): TranEnergyState {
  const caps = new Map<string, number>();
  const inductors = new Map<string, number>();
  const tran = res.tran;
  if (!tran?.time?.length) return { caps, inductors };

  const nettled = assignNets(doc);
  const last = tran.time.length - 1;
  const vOf = (net: string): number | null => {
    if (net === nettled.groundNet) return 0;
    const s = tran.nodeVoltages.find((x) => x.id === net);
    const v = s?.values[last];
    return typeof v === 'number' ? v : null;
  };

  for (const c of nettled.components) {
    if (c.modelKey === 'capacitor') {
      const na = c.pins['a']?.net;
      const nb = c.pins['b']?.net;
      if (!na || !nb) continue;
      const va = vOf(na);
      const vb = vOf(nb);
      if (va === null || vb === null) continue;
      caps.set(c.id, va - vb);
    }
    if (c.modelKey === 'inductor') {
      const series = tran.branchCurrents.find((s) => s.id === c.id);
      const i = series?.values[last];
      if (typeof i === 'number') inductors.set(c.id, i);
    }
  }
  return { caps, inductors };
}

/** C/L state at a specific transient sample (for mid-discharge parameter edits). */
export function extractEnergyStateAtIndex(
  doc: SchematicDocument,
  res: SimulateResponse,
  idx: number
): TranEnergyState {
  const caps = new Map<string, number>();
  const inductors = new Map<string, number>();
  const tran = res.tran;
  if (!tran?.time?.length) return { caps, inductors };

  const nettled = assignNets(doc);
  const last = Math.max(0, Math.min(idx, tran.time.length - 1));
  const vOf = (net: string): number | null => {
    if (net === nettled.groundNet) return 0;
    const s = tran.nodeVoltages.find((x) => x.id === net);
    const v = s?.values[last];
    return typeof v === 'number' ? v : null;
  };

  for (const c of nettled.components) {
    if (c.modelKey === 'capacitor') {
      const na = c.pins['a']?.net;
      const nb = c.pins['b']?.net;
      if (!na || !nb) continue;
      const va = vOf(na);
      const vb = vOf(nb);
      if (va === null || vb === null) continue;
      caps.set(c.id, va - vb);
    }
    if (c.modelKey === 'inductor') {
      const series = tran.branchCurrents.find((s) => s.id === c.id);
      const i = series?.values[last];
      if (typeof i === 'number') inductors.set(c.id, i);
    }
  }
  return { caps, inductors };
}

/**
 * Peak |Vc| from the transient waveform — use when opening the switch so discharge
 * seeds from the charged state even if the last sample is already settling.
 */
export function extractChargedCapState(doc: SchematicDocument, res: SimulateResponse): TranEnergyState {
  const base = extractEnergyState(doc, res);
  const caps = new Map<string, number>();

  for (const c of assignNets(doc).components) {
    if (c.modelKey !== 'capacitor') continue;
    const series = capVoltageSeriesFromTran(doc, res, c.id);
    if (!series?.length) {
      const v = base.caps.get(c.id);
      if (v !== undefined) caps.set(c.id, v);
      continue;
    }
    let bestIdx = 0;
    let bestMag = 0;
    for (let i = 0; i < series.length; i++) {
      const mag = Math.abs(series[i]!);
      if (mag > bestMag) {
        bestMag = mag;
        bestIdx = i;
      }
    }
    caps.set(c.id, series[bestIdx]!);
  }

  return { caps, inductors: base.inductors };
}

export function injectEnergyState(circuit: CompiledCircuit, state: TranEnergyState): CompiledCircuit {
  if (!state.caps.size && !state.inductors.size) return circuit;
  return {
    ...circuit,
    elements: circuit.elements.map((el) => {
      const capIc = state.caps.get(el.id);
      const indIc = state.inductors.get(el.id);
      if (capIc === undefined && indIc === undefined) return el;
      const params = { ...el.params };
      if (capIc !== undefined) params['ic'] = capIc;
      if (indIc !== undefined) params['ic'] = indIc;
      return { ...el, params };
    })
  };
}

export function mergeTranSegment(
  prev: TranResult | null,
  next: TranResult,
  timeOffset: number
): TranResult {
  if (!prev) {
    return {
      time: [...next.time],
      nodeVoltages: next.nodeVoltages.map((s) => ({ id: s.id, values: [...s.values] })),
      branchCurrents: next.branchCurrents.map((s) => ({ id: s.id, values: [...s.values] }))
    };
  }

  const skip = next.time.length > 1 ? 1 : 0;
  const time = [...prev.time, ...next.time.slice(skip).map((t) => t + timeOffset)];

  const mergeSeries = (a: TranSeries[], b: TranSeries[]): TranSeries[] => {
    const byId = new Map(a.map((s) => [s.id, [...s.values]]));
    for (const s of b) {
      const existing = byId.get(s.id) ?? [];
      byId.set(s.id, [...existing, ...(skip ? s.values.slice(skip) : s.values)]);
    }
    return [...byId.entries()].map(([id, values]) => ({ id, values }));
  };

  return {
    time,
    nodeVoltages: mergeSeries(prev.nodeVoltages, next.nodeVoltages),
    branchCurrents: mergeSeries(prev.branchCurrents, next.branchCurrents)
  };
}

/** True when cap / inductor states are flat at the end of the segment. */
export function isEnergySettled(doc: SchematicDocument, res: SimulateResponse): boolean {
  const tran = res.tran;
  if (!tran || tran.time.length < 3) return true;

  const last = tran.time.length - 1;
  const prev = last - 1;
  const dt = (tran.time[last]! - tran.time[prev]!) || 0.002;
  const tau = estimateDominantTau(doc);

  for (const c of doc.components) {
    if (c.modelKey === 'capacitor') {
      const series = capVoltageSeriesFromTran(doc, res, c.id);
      if (!series || series.length < 2) continue;
      const absV = Math.abs(series[last]!);
      const dv = Math.abs(series[last]! - series[prev]!);
      const dvdt = dv / dt;

      // Exponential tail: |dV/dt| ≈ |V|/τ when still moving; 5% of that is "settled".
      if (tau !== null && absV > 0.01) {
        const tailRate = absV / tau;
        if (dvdt > tailRate * 0.05) return false;
      } else if (absV > 0.01) {
        const scale = Math.max(absV, 0.1);
        if (dv / scale > 0.002) return false;
      }
    }
    if (c.modelKey === 'inductor') {
      const series = tran.branchCurrents.find((s) => s.id === c.id);
      if (!series || series.values.length < 2) continue;
      const absI = Math.abs(series.values[last]!);
      const di = Math.abs(series.values[last]! - series.values[prev]!);
      const didt = di / dt;
      if (tau !== null && absI > 1e-4) {
        const tailRate = absI / tau;
        if (didt > tailRate * 0.05) return false;
      } else {
        const scale = Math.max(absI, 1e-3);
        if (di / scale > 0.002) return false;
      }
    }
  }
  return true;
}

function capVoltageSeriesFromTran(
  doc: SchematicDocument,
  res: SimulateResponse,
  capId: string
): number[] | null {
  const tran = res.tran;
  if (!tran) return null;
  const nettled = assignNets(doc);
  const cap = nettled.components.find((c) => c.id === capId);
  if (!cap) return null;
  const na = cap.pins['a']?.net;
  const nb = cap.pins['b']?.net;
  if (!na || !nb) return null;
  const vOf = (net: string): number[] | null => {
    if (net === nettled.groundNet) return tran.time.map(() => 0);
    const s = tran.nodeVoltages.find((x) => x.id === net);
    return s?.values?.length ? s.values : null;
  };
  const va = vOf(na);
  const vb = vOf(nb);
  if (!va?.length || !vb?.length) return null;
  return va.map((v, i) => v - (vb[i] ?? 0));
}

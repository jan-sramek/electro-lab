import { createNe555AstablePreset } from '../presets/ne555-astable.preset';
import { createNe555ChristmasTreePreset } from '../presets/ne555-christmas-tree.preset';
import { createNmosSwitchPreset } from '../presets/nmos-switch.preset';
import { createLedPreset } from '../presets/led-series.preset';
import { createLedFadePreset } from '../presets/led-fade.preset';
import { createBuckPreset } from '../presets/buck.preset';
import { createBoostPreset } from '../presets/boost.preset';
import { createHalfWavePreset } from '../presets/half-wave.preset';
import { createBridgePreset } from '../presets/bridge.preset';
import { createFilterCapPreset } from '../presets/filter-cap.preset';
import { createNtcDividerPreset } from '../presets/ntc-divider.preset';
import { createSeriesParallelPreset } from '../presets/series-parallel.preset';
import { createDiodeDirectionPreset } from '../presets/diode-direction.preset';
import { createSeriesLedsPreset } from '../presets/series-leds.preset';
import { createVoltageDividerPreset } from '../presets/voltage-divider.preset';
import { createZenerPreset } from '../presets/zener.preset';
import { createPotDividerPreset } from '../presets/pot-divider.preset';
import { createMotorNmosPreset } from '../presets/motor-nmos.preset';
import { createRcStepPreset } from '../presets/rc-step.preset';
import { createRelayDiodePreset } from '../presets/relay-diode.preset';
import { createOpAmpFollowerPreset } from '../presets/opamp-follower.preset';
import { createReversePolarityPreset } from '../presets/reverse-polarity.preset';
import { createVreg7805Preset } from '../presets/vreg-7805.preset';
import { createHBridgePreset } from '../presets/h-bridge.preset';
import { createMotorPwmPreset } from '../presets/motor-pwm.preset';
import { createFuseProtectPreset } from '../presets/fuse-protect.preset';
import { createPullUpDownPreset } from '../presets/pull-up-down.preset';
import { createPwmFilterPreset } from '../presets/pwm-filter.preset';
import { createDebouncePreset } from '../presets/debounce.preset';
import { createRipplePreset } from '../presets/ripple.preset';
import { createBjtSwitchPreset } from '../presets/bjt-switch.preset';
import { createLdrNightLightPreset } from '../presets/ldr-nightlight.preset';
import { createIndustrial24vPreset } from '../presets/industrial-24v.preset';
import { createMotorDirectionPreset } from '../presets/motor-direction.preset';
import { createEstopRelayPreset } from '../presets/estop-relay.preset';
import { createRelayBjtPreset } from '../presets/relay-bjt.preset';
import { createOpAmpNonInvPreset } from '../presets/opamp-noninv.preset';
import { createArduinoLedPreset } from '../presets/arduino-led.preset';
import { createBuzzerButtonPreset } from '../presets/buzzer-button.preset';
import { createPushbuttonLedPreset } from '../presets/pushbutton-led.preset';
import { createPulseRcPreset } from '../presets/pulse-rc.preset';
import { createAcRcPreset } from '../presets/ac-rc.preset';
import { createRcLowPassPreset } from '../presets/rc-low-pass.preset';
import { createRcHighPassPreset } from '../presets/rc-high-pass.preset';
import { createMeasureAcPreset } from '../presets/measure-ac.preset';
import { createBandPassPreset } from '../presets/band-pass.preset';
import { createNotchFilterPreset } from '../presets/notch-filter.preset';
import { createRlcSeriesPreset } from '../presets/rlc-series.preset';
import { createI2cOledPreset } from '../presets/i2c-oled.preset';
import { createOpAmpBufferPreset } from '../presets/opamp-buffer.preset';
import { createOpAmpComparatorPreset } from '../presets/opamp-comparator.preset';
import { createOpAmpSchmittPreset } from '../presets/opamp-schmitt.preset';
import { createOpAmpSummingPreset } from '../presets/opamp-summing.preset';
import { createOpAmpIntegratorPreset } from '../presets/opamp-integrator.preset';
import { createOpAmpDifferentiatorPreset } from '../presets/opamp-differentiator.preset';
import { createOpAmpActiveFilterPreset } from '../presets/opamp-active-filter.preset';
import { createNe555PotBlinkPreset } from '../presets/ne555-pot-blink.preset';

import { SchematicDocument, assignNets, compileNetlist, paramNumber, pinKey } from '../schematic.model';
import { SimulateResponse } from '../../api/circuit-api.types';
import { RELAY_COIL_SUFFIX, estimateAllWireCurrents } from '../wire-current';
import { isPinCurrentModeled, pinOutflowAmps } from './wire-current-field';
import { resolveCapacitorBranchCurrent } from '../cap-branch-current';
import { equalizeSeriesBranchCurrent } from '../series-branch-current';
import { estimateDominantTau } from '../tran-continuation';

const PRESETS: Record<string, () => SchematicDocument> = {
  Ne555Astable: createNe555AstablePreset,
  Ne555ChristmasTree: createNe555ChristmasTreePreset,
  NmosSwitch: createNmosSwitchPreset,
  Led: createLedPreset,
  LedFade: createLedFadePreset,
  Buck: createBuckPreset,
  Boost: createBoostPreset,
  HalfWave: createHalfWavePreset,
  Bridge: createBridgePreset,
  FilterCap: createFilterCapPreset,
  NtcDivider: createNtcDividerPreset,
  SeriesParallel: createSeriesParallelPreset,
  DiodeDirection: createDiodeDirectionPreset,
  SeriesLeds: createSeriesLedsPreset,
  VoltageDivider: createVoltageDividerPreset,
  Zener: createZenerPreset,
  PotDivider: createPotDividerPreset,
  MotorNmos: createMotorNmosPreset,
  RcStep: createRcStepPreset,
  RelayDiode: createRelayDiodePreset,
  OpAmpFollower: createOpAmpFollowerPreset,
  ReversePolarity: createReversePolarityPreset,
  Vreg7805: createVreg7805Preset,
  HBridge: createHBridgePreset,
  MotorPwm: createMotorPwmPreset,
  FuseProtect: createFuseProtectPreset,
  PullUpDown: createPullUpDownPreset,
  PwmFilter: createPwmFilterPreset,
  Debounce: createDebouncePreset,
  Ripple: createRipplePreset,
  BjtSwitch: createBjtSwitchPreset,
  LdrNightLight: createLdrNightLightPreset,
  Industrial24v: createIndustrial24vPreset,
  MotorDirection: createMotorDirectionPreset,
  EstopRelay: createEstopRelayPreset,
  RelayBjt: createRelayBjtPreset,
  OpAmpNonInv: createOpAmpNonInvPreset,
  ArduinoLed: createArduinoLedPreset,
  BuzzerButton: createBuzzerButtonPreset,
  PushbuttonLed: createPushbuttonLedPreset,
  PulseRc: createPulseRcPreset,
  AcRc: createAcRcPreset,
  RcLowPass: createRcLowPassPreset,
  RcHighPass: createRcHighPassPreset,
  MeasureAc: createMeasureAcPreset,
  BandPass: createBandPassPreset,
  NotchFilter: createNotchFilterPreset,
  RlcSeries: createRlcSeriesPreset,
  I2cOled: createI2cOledPreset,
  OpAmpBuffer: createOpAmpBufferPreset,
  OpAmpComparator: createOpAmpComparatorPreset,
  OpAmpSchmitt: createOpAmpSchmittPreset,
  OpAmpSumming: createOpAmpSummingPreset,
  OpAmpIntegrator: createOpAmpIntegratorPreset,
  OpAmpDifferentiator: createOpAmpDifferentiatorPreset,
  OpAmpActiveFilter: createOpAmpActiveFilterPreset,
  Ne555PotBlink: createNe555PotBlinkPreset
};

async function simulate(body: unknown): Promise<SimulateResponse> {
  const r = await fetch('http://localhost:5080/api/circuit/simulate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  return (await r.json()) as SimulateResponse;
}

/** Replica of the canvas current pipeline (raw → cap resolve → 1e-5 floor → series equalize). */
function canvasCurrentOf(doc: SchematicDocument, res: SimulateResponse, idx: number): (id: string) => number | null {
  const raw = (id: string): number | null => {
    if (res.tran && res.analysisType === 'tran') {
      const s = res.tran.branchCurrents.find((x) => x.id === id);
      const i = s?.values[Math.max(0, Math.min(idx, (s?.values.length ?? 1) - 1))];
      return typeof i === 'number' ? i : null;
    }
    const i = res.dcOp?.branchCurrents?.[id];
    return typeof i === 'number' ? i : null;
  };
  const resolved = (id: string): number | null => {
    const comp = doc.components.find((c) => c.id === id);
    let i: number | null;
    if (comp?.modelKey === 'capacitor' && res.tran) i = resolveCapacitorBranchCurrent(doc, id, res, idx, raw(id));
    else i = raw(id);
    if (typeof i === 'number' && Math.abs(i) < 1e-5) return 0;
    return i;
  };
  const nettled = assignNets(doc);
  const voltage = (net: string): number | null => {
    if (net === nettled.groundNet) return 0;
    if (res.tran && res.analysisType === 'tran') {
      const sv = res.tran.nodeVoltages.find((x) => x.id === net);
      const v = sv?.values[Math.max(0, Math.min(idx, (sv?.values.length ?? 1) - 1))];
      return typeof v === 'number' ? v : null;
    }
    const v = res.dcOp?.nodeVoltages?.[net];
    return typeof v === 'number' ? v : null;
  };
  const coil = (relayId: string): number | null => {
    const c = nettled.components.find((x) => x.id === relayId);
    if (!c || c.modelKey !== 'relay') return null;
    const vp = voltage(c.pins['cp']?.net ?? '');
    const vn = voltage(c.pins['cn']?.net ?? '');
    if (vp === null || vn === null) return null;
    const r = paramNumber(c.params, 'rCoil', 0);
    if (!(r > 0)) return null;
    const i = (vp - vn) / r;
    return Math.abs(i) < 1e-5 ? 0 : i;
  };
  const inner = (id: string, visiting: Set<string>): number | null => {
    if (visiting.has(id)) return resolved(id);
    visiting.add(id);
    const eq = equalizeSeriesBranchCurrent(doc, id, resolved(id), (o) => inner(o, visiting));
    if (typeof eq === 'number' && Math.abs(eq) < 1e-5) return 0;
    return eq;
  };
  return (id) => (id.endsWith(RELAY_COIL_SUFFIX) ? coil(id.slice(0, -RELAY_COIL_SUFFIX.length)) : inner(id, new Set()));
}

interface Oracle { exact: Map<string, number>; determined: Set<string>; inconsistent: number }

/** Exact KCL: one equation per pin node with known injection; all ground symbols form one node. */
function exactWireCurrents(doc: SchematicDocument, currentOf: (id: string) => number | null): Oracle {
  const wires = doc.wires;
  const byId = new Map(doc.components.map((c) => [c.id, c] as const));
  const nodeOf = (ref: { componentId: string; pin: string }): string => {
    const c = byId.get(ref.componentId);
    return c?.modelKey === 'ground' ? 'GROUND' : pinKey(ref);
  };
  const nodes = new Map<string, { inj: number | null; wires: { w: number; sign: number }[] }>();
  wires.forEach((w, wi) => {
    for (const [ref, sign] of [[w.a, 1], [w.b, -1]] as const) {
      const n = nodeOf(ref);
      let node = nodes.get(n);
      if (!node) {
        const c = byId.get(ref.componentId);
        let inj: number | null = 0;
        if (c && c.modelKey !== 'ground' && c.modelKey !== 'junction' && c.modelKey !== 'voltmeter') {
          if (c.modelKey === 'relay' && (ref.pin === 'cp' || ref.pin === 'cn')) {
            const ic = currentOf(c.id + RELAY_COIL_SUFFIX);
            inj = typeof ic === 'number' ? pinOutflowAmps(c.modelKey, ref.pin, ic) : null;
          } else if (!isPinCurrentModeled(c.modelKey, ref.pin)) inj = null;
          else {
            const i = currentOf(c.id);
            inj = typeof i === 'number' ? pinOutflowAmps(c.modelKey, ref.pin, i) : null;
          }
        }
        node = { inj, wires: [] };
        nodes.set(n, node);
      }
      node.wires.push({ w: wi, sign });
    }
  });
  const rows: number[][] = [];
  for (const node of nodes.values()) {
    if (node.inj === null) continue;
    const row = new Array<number>(wires.length + 1).fill(0);
    for (const { w, sign } of node.wires) row[w] += sign; // leaving = +i if pin is a, -i if pin is b
    row[wires.length] = node.inj;
    rows.push(row);
  }
  // RREF
  const m = rows.length;
  const n = wires.length;
  const pivots: number[] = [];
  let r = 0;
  for (let c = 0; c < n && r < m; c++) {
    let best = r;
    for (let i = r + 1; i < m; i++) if (Math.abs(rows[i]![c]!) > Math.abs(rows[best]![c]!)) best = i;
    if (Math.abs(rows[best]![c]!) < 1e-9) continue;
    [rows[r], rows[best]] = [rows[best]!, rows[r]!];
    const pv = rows[r]![c]!;
    for (let k = 0; k <= n; k++) rows[r]![k]! /= pv;
    for (let i = 0; i < m; i++) {
      if (i === r) continue;
      const f = rows[i]![c]!;
      if (Math.abs(f) < 1e-12) continue;
      for (let k = 0; k <= n; k++) rows[i]![k]! -= f * rows[r]![k]!;
    }
    pivots.push(c);
    r++;
  }
  let inconsistent = 0;
  for (let i = r; i < m; i++) inconsistent = Math.max(inconsistent, Math.abs(rows[i]![n]!));
  const free = new Set<number>();
  for (let c = 0; c < n; c++) if (!pivots.includes(c)) free.add(c);
  const exact = new Map<string, number>();
  const determined = new Set<string>();
  pivots.forEach((c, i) => {
    const row = rows[i]!;
    let dependsOnFree = false;
    for (const f of free) if (Math.abs(row[f]!) > 1e-9) dependsOnFree = true;
    exact.set(wires[c]!.id, row[n]!); // free vars = 0
    if (!dependsOnFree) determined.add(wires[c]!.id);
  });
  for (const f of free) exact.set(wires[f]!.id, 0);
  return { exact, determined, inconsistent };
}

function describeWire(doc: SchematicDocument, id: string): string {
  const w = doc.wires.find((x) => x.id === id)!;
  return `${w.a.componentId}.${w.a.pin}→${w.b.componentId}.${w.b.pin}`;
}

/**
 * Diagnostic, pending by default (needs the CircuitEngine on :5080 and CORS).
 * Flip `xdescribe` → `describe` and run only this file to compare the heuristic
 * wire-flow solver against exact KCL on every preset with real engine currents.
 * Known, accepted differences: ground-symbol return wires animate for teaching
 * even when no net current flows into the symbol; 555 / op-amp / regulator /
 * BJT-base pins have no engine current, so the oracle cannot judge their wires.
 */
xdescribe('wire flow oracle (local, needs engine on :5080)', () => {
  it('compares heuristic wire flow with exact KCL on every preset', async () => {
    const findings: string[] = [];
    let checks = 0;
    for (const [name, make] of Object.entries(PRESETS)) {
      const doc = assignNets(make());
      const circuit = compileNetlist(doc);
      const runs: { label: string; res: SimulateResponse; indices: number[] }[] = [];
      const dc = await simulate({ schemaVersion: 1, analysis: { type: 'dcOp' }, circuit });
      if (dc.ok && dc.dcOp) runs.push({ label: 'dc', res: dc, indices: [0] });
      else findings.push(`[ORACLE-SKIP ${name} dc] ${(dc.errors ?? []).join('; ')}`);
      const dynamic = doc.components.some((c) => ['capacitor', 'inductor', 'pulse_source', 'ac_source', 'ne555'].includes(c.modelKey));
      if (dynamic) {
        const tau = estimateDominantTau(doc);
        const tStop = tau ? Math.min(Math.max(5 * tau, 0.02), 10) : 0.02;
        const dt = tStop / 2000;
        const tr = await simulate({ schemaVersion: 1, analysis: { type: 'tran', tStop, dt, initFromDc: false }, circuit });
        if (tr.ok && tr.tran?.time.length) {
          const n = tr.tran.time.length;
          runs.push({ label: 'tran', res: tr, indices: [1, Math.floor(n * 0.1), Math.floor(n * 0.5), n - 1] });
        } else findings.push(`[ORACLE-SKIP ${name} tran] ${(tr.errors ?? []).join('; ')}`);
      }
      for (const run of runs) {
        for (const idx of run.indices) {
          const currentOf = canvasCurrentOf(doc, run.res, idx);
          const heuristic = estimateAllWireCurrents(doc.components, doc.wires, currentOf);
          const oracle = exactWireCurrents(doc, currentOf);
          let scale = 0;
          for (const v of oracle.exact.values()) scale = Math.max(scale, Math.abs(v));
          const tol = Math.max(2e-5, scale * 0.05);
          if (oracle.inconsistent > tol) findings.push(`[ORACLE-INCONSISTENT ${name} ${run.label}#${idx}] residual ${(oracle.inconsistent * 1e3).toFixed(3)}mA`);
          for (const w of doc.wires) {
            if (!oracle.determined.has(w.id)) continue;
            checks++;
            const h = heuristic.get(w.id) ?? 0;
            const o = oracle.exact.get(w.id) ?? 0;
            if (Math.abs(h - o) > tol) {
              findings.push(`[ORACLE ${name} ${run.label}#${idx}] ${w.id} (${describeWire(doc, w.id)}) heuristic=${(h * 1e3).toFixed(3)}mA exact=${(o * 1e3).toFixed(3)}mA`);
            }
          }
        }
      }
    }
    console.log(`[ORACLE-SUMMARY] checks=${checks} findings=${findings.length}`);
    for (const f of findings) console.log(f);
    expect(true).toBeTrue();
  }, 300000);
});

import { createLedFadePreset } from './presets/led-fade.preset';
import { createRcStepPreset } from './presets/rc-step.preset';
import {
  effectiveTargetTStop,
  estimateDominantTau,
  estimateSettlingTStop,
  isEnergySettled,
  mergeTranSegment,
  planTranSegments,
  TRAN_MAX_STEPS
} from './tran-continuation';
import { assignNets } from './schematic.model';
import { SimulateResponse } from '../api/circuit-api.types';

describe('tran-continuation', () => {
  it('plans multiple segments when target exceeds engine step cap', () => {
    const dt = 0.002;
    const maxSeg = TRAN_MAX_STEPS * dt;
    const segments = planTranSegments(maxSeg * 2.5, dt);
    expect(segments.length).toBe(3);
    expect(segments.reduce((a, b) => a + b, 0)).toBeCloseTo(maxSeg * 2.5, 6);
  });

  it('extends user tStop when RC settling needs longer', () => {
    const doc = createLedFadePreset();
    const bigCap = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'capacitor' ? { ...c, params: { ...c.params, c: 0.05 } } : c
      )
    };
    const dt = 0.002;
    const user = 6;
    const settling = estimateSettlingTStop(bigCap, dt)!;
    expect(settling).toBeGreaterThan(user);
    expect(effectiveTargetTStop(bigCap, user, dt)).toBe(settling);
  });

  it('merges transient segments with continuous time', () => {
    const a = {
      time: [0, 0.001, 0.002],
      nodeVoltages: [{ id: 'n1', values: [0, 1, 2] }],
      branchCurrents: [{ id: 'R1', values: [0, 0.01, 0.02] }]
    };
    const b = {
      time: [0, 0.001, 0.002],
      nodeVoltages: [{ id: 'n1', values: [2, 1.5, 1] }],
      branchCurrents: [{ id: 'R1', values: [0.02, 0.015, 0.01] }]
    };
    const merged = mergeTranSegment(a, b, 0.002);
    expect(merged.time).toEqual([0, 0.001, 0.002, 0.003, 0.004]);
    expect(merged.nodeVoltages[0].values).toEqual([0, 1, 2, 1.5, 1]);
  });

  it('returns null settling time for circuits without storage', () => {
    const doc = createRcStepPreset();
    const withoutC = {
      ...doc,
      components: doc.components.filter((c) => c.modelKey !== 'capacitor')
    };
    expect(estimateSettlingTStop(withoutC, 5e-5)).toBeNull();
  });

  it('estimates long tau for large capacitors in LED fade', () => {
    const doc = createLedFadePreset();
    const bigCap = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'capacitor' ? { ...c, params: { ...c.params, c: 0.1022 } } : c
      )
    };
    const tau = estimateDominantTau(bigCap)!;
    expect(tau).toBeGreaterThan(20);
    expect(tau).toBeLessThan(30);
    expect(estimateSettlingTStop(bigCap, 0.002)!).toBeCloseTo(5 * tau, 0);
  });

  it('does not treat a slow RC discharge as settled while significant charge remains', () => {
    const doc = createLedFadePreset();
    const bigCap = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'capacitor' ? { ...c, params: { ...c.params, c: 0.1022 } } : c
      )
    };
    const res = capVoltageTran(bigCap, [5, 1.0, 0.999]);
    expect(isEnergySettled(bigCap, res)).toBeFalse();
  });

  it('treats a near-empty capacitor as settled', () => {
    const doc = createLedFadePreset();
    const bigCap = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'capacitor' ? { ...c, params: { ...c.params, c: 0.1022 } } : c
      )
    };
    const res = capVoltageTran(bigCap, [5, 0.03, 0.02999]);
    expect(isEnergySettled(bigCap, res)).toBeTrue();
  });
});

function capVoltageTran(doc: ReturnType<typeof createLedFadePreset>, vc: number[]): SimulateResponse {
  const nettled = assignNets(doc);
  const cap = nettled.components.find((c) => c.modelKey === 'capacitor')!;
  const na = cap.pins['a']!.net;
  const dt = 0.002;
  const time = vc.map((_, i) => i * dt);
  return {
    schemaVersion: 1,
    ok: true,
    analysisType: 'tran',
    errors: [],
    warnings: [],
    tran: {
      time,
      nodeVoltages: [{ id: na, values: vc }],
      branchCurrents: []
    }
  };
}

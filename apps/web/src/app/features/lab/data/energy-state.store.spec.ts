import { assignNets } from './schematic.model';
import { SimulateResponse } from '../api/circuit-api.types';
import { EnergyStateStore } from './energy-state.store';
import { createLedFadePreset } from './presets/led-fade.preset';

describe('EnergyStateStore', () => {
  it('seeds discharge runs when the switch is open', () => {
    const store = new EnergyStateStore();
    const doc = createLedFadePreset();
    store.capture(doc, fakeTranRes(doc, { C1: 1.5 }));

    const open = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    };
    const seed = store.seedForDischargeRun(open);
    expect(seed?.caps.get('C1')).toBeCloseTo(1.5, 3);
  });

  it('does not seed discharge when stored voltage is negligible', () => {
    const store = new EnergyStateStore();
    const doc = createLedFadePreset();
    store.capture(doc, fakeTranRes(doc, { C1: 0.01 }));

    const open = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    };
    expect(store.seedForDischargeRun(open)).toBeNull();
  });

  it('does not seed charge runs when the switch is closed', () => {
    const store = new EnergyStateStore();
    const doc = createLedFadePreset();
    store.capture(doc, fakeTranRes(doc, { C1: 4.8 }));

    const reclosed = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: true } } : c
      )
    };
    expect(store.seedForDischargeRun(reclosed)).toBeNull();
    expect(store.seedForRun(reclosed)?.caps.get('C1')).toBeCloseTo(4.8, 3);
  });

  it('clears when topology fingerprint changes', () => {
    const store = new EnergyStateStore();
    const doc = createLedFadePreset();
    store.capture(doc, fakeTranRes(doc, { C1: 3 }));
    const rewired = { ...doc, wires: doc.wires.slice(0, -1) };
    store.clearIfStale(rewired);
    expect(store.hasSeed()).toBeFalse();
  });

  it('keeps seed when only capacitor id changes', () => {
    const store = new EnergyStateStore();
    const doc = createLedFadePreset();
    store.capture(doc, fakeTranRes(doc, { C1: 2.2 }));
    const renamed = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'capacitor' ? { ...c, id: 'C9' } : c
      ),
      wires: doc.wires.map((w) => ({
        ...w,
        a: { ...w.a, componentId: w.a.componentId === 'C1' ? 'C9' : w.a.componentId },
        b: { ...w.b, componentId: w.b.componentId === 'C1' ? 'C9' : w.b.componentId }
      }))
    };
    const seed = store.seedForRun(assignNets(renamed));
    expect(seed?.caps.get('C9')).toBeCloseTo(2.2, 3);
  });

  it('captureChargePrior uses peak Vc from the waveform', () => {
    const store = new EnergyStateStore();
    const doc = createLedFadePreset();
    const res = rampingCapTran(doc);
    store.captureChargePrior(doc, res);

    const open = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    };
    expect(store.seedForDischargeRun(open)?.caps.get('C1')).toBeCloseTo(4.8, 2);
  });

  it('captureAtIndex snapshots Vc at the scrub frame', () => {
    const store = new EnergyStateStore();
    const doc = createLedFadePreset();
    const res = rampingCapTran(doc);
    store.captureAtIndex(doc, res, 3);
    expect(store.maxCapVoltageAbs()).toBeCloseTo(4.2, 2);
  });
});

function fakeTranRes(
  doc: ReturnType<typeof createLedFadePreset>,
  capVolts: Record<string, number>
): SimulateResponse {
  const nettled = assignNets(doc);
  const nodeVoltages: { id: string; values: number[] }[] = [];
  const seen = new Set<string>();

  for (const c of nettled.components) {
    if (c.modelKey !== 'capacitor') continue;
    const v = capVolts[c.id] ?? 0;
    const na = c.pins['a']?.net;
    const nb = c.pins['b']?.net;
    if (!na || !nb) continue;
    if (!seen.has(na)) {
      nodeVoltages.push({ id: na, values: [v, v] });
      seen.add(na);
    }
    if (!seen.has(nb)) {
      nodeVoltages.push({ id: nb, values: [0, 0] });
      seen.add(nb);
    }
  }

  return {
    schemaVersion: 1,
    ok: true,
    analysisType: 'tran',
    errors: [],
    warnings: [],
    tran: { time: [0, 0.001], nodeVoltages, branchCurrents: [] }
  };
}

/** Charge ramp where the last sample is still below peak Vc. */
function rampingCapTran(doc: ReturnType<typeof createLedFadePreset>): SimulateResponse {
  const nettled = assignNets(doc);
  const cap = nettled.components.find((c) => c.modelKey === 'capacitor')!;
  const na = cap.pins['a']!.net;
  const values = [0, 2.5, 4.8, 4.2];
  return {
    schemaVersion: 1,
    ok: true,
    analysisType: 'tran',
    errors: [],
    warnings: [],
    tran: {
      time: [0, 0.1, 0.2, 0.3],
      nodeVoltages: [{ id: na, values }],
      branchCurrents: []
    }
  };
}

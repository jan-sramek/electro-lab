import {
  allSwitchesOpen,
  compileNetlistWithCapIc,
  finalCapVoltagesFromTran,
  schematicCapFingerprint
} from './cap-ic';
import { createLedFadePreset } from './presets/led-fade.preset';
import { SimulateResponse } from '../api/circuit-api.types';

describe('cap-ic helpers', () => {
  it('fingerprints change when a wire is added', () => {
    const doc = createLedFadePreset();
    const a = schematicCapFingerprint(doc);
    const b = schematicCapFingerprint({
      ...doc,
      wires: [
        ...doc.wires,
        { id: 'WX', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'V1', pin: 'n' } }
      ]
    });
    expect(a).not.toEqual(b);
  });

  it('allSwitchesOpen follows closed flag', () => {
    const doc = createLedFadePreset();
    expect(allSwitchesOpen(doc)).toBeFalse();
    const open = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'switch' ? { ...c, params: { ...c.params, closed: false } } : c
      )
    };
    expect(allSwitchesOpen(open)).toBeTrue();
  });

  it('compileNetlistWithCapIc injects ic only when asked', () => {
    const doc = createLedFadePreset();
    const stored = new Map([['C1', 4.5]]);
    const cold = compileNetlistWithCapIc(doc, stored, false);
    expect(cold.elements.find((e) => e.id === 'C1')?.params['ic']).toBeUndefined();
    const hot = compileNetlistWithCapIc(doc, stored, true);
    expect(hot.elements.find((e) => e.id === 'C1')?.params['ic']).toBe(4.5);
  });

  it('finalCapVoltagesFromTran reads last node samples', () => {
    const doc = createLedFadePreset();
    const nettled = doc; // already assigned in factory
    const nA = nettled.components.find((c) => c.id === 'C1')!.pins['a'].net;
    const res: SimulateResponse = {
      schemaVersion: 1,
      ok: true,
      analysisType: 'tran',
      errors: [],
      warnings: [],
      tran: {
        time: [0, 1],
        nodeVoltages: [
          { id: nA, values: [0, 4.2] },
          { id: 'gnd', values: [0, 0] }
        ],
        branchCurrents: []
      }
    };
    // C1 b is on ground rail — assign nets so b is gnd
    const map = finalCapVoltagesFromTran(doc, res);
    expect(map.get('C1')).toBeCloseTo(4.2, 5);
  });
});

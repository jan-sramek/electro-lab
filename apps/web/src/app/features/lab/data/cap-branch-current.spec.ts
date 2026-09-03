import { createLedFadePreset } from './presets/led-fade.preset';
import { assignNets } from './schematic.model';
import { SimulateResponse } from '../api/circuit-api.types';
import {
  capCurrentFromTranVoltage,
  resolveCapacitorBranchCurrent
} from './cap-branch-current';
import { estimateAllWireCurrents } from './wire-current';

describe('cap-branch-current', () => {
  it('derives charging current from node voltages when branch I is zero', () => {
    const doc = createLedFadePreset();
    const nettled = assignNets(doc);
    const cap = nettled.components.find((c) => c.id === 'C1')!;
    const na = cap.pins['a']!.net;
    const nb = cap.pins['b']!.net;

    const res: SimulateResponse = {
      schemaVersion: 1,
      ok: true,
      analysisType: 'tran',
      errors: [],
      warnings: [],
      tran: {
        time: [0, 0.002, 0.004],
        nodeVoltages: [
          { id: na, values: [0, 0.5, 1.0] },
          { id: nb, values: [0, 0, 0] }
        ],
        branchCurrents: [{ id: 'C1', values: [0, 0, 0] }]
      }
    };

    const i1 = capCurrentFromTranVoltage(doc, cap, res, 1);
    expect(i1).not.toBeNull();
    expect(Math.abs(i1!)).toBeGreaterThan(0.4);

    const resolved = resolveCapacitorBranchCurrent(doc, 'C1', res, 1, 0);
    expect(Math.abs(resolved!)).toBeGreaterThan(0.4);
  });

  it('derives charging current when ground net is omitted from nodeVoltages', () => {
    const doc = createLedFadePreset();
    const nettled = assignNets(doc);
    const cap = nettled.components.find((c) => c.id === 'C1')!;
    const na = cap.pins['a']!.net;
    expect(cap.pins['b']!.net).toBe('gnd');

    const res: SimulateResponse = {
      schemaVersion: 1,
      ok: true,
      analysisType: 'tran',
      errors: [],
      warnings: [],
      tran: {
        time: [0, 0.002, 0.004],
        nodeVoltages: [{ id: na, values: [0, 1.0, 2.0] }],
        branchCurrents: [{ id: 'C1', values: [0, 0, 0] }]
      }
    };

    const i0 = capCurrentFromTranVoltage(doc, cap, res, 0);
    expect(i0).not.toBeNull();
    expect(Math.abs(i0!)).toBeGreaterThan(0.4);

    const resolved = resolveCapacitorBranchCurrent(doc, 'C1', res, 0, 0);
    expect(Math.abs(resolved!)).toBeGreaterThan(0.4);
  });

  it('treats teaching-noise residuals as zero', () => {
    const doc = createLedFadePreset();
    const nettled = assignNets(doc);
    const cap = nettled.components.find((c) => c.id === 'C1')!;
    const na = cap.pins['a']!.net;

    const res: SimulateResponse = {
      schemaVersion: 1,
      ok: true,
      analysisType: 'tran',
      errors: [],
      warnings: [],
      tran: {
        time: [0, 0.002],
        nodeVoltages: [{ id: na, values: [5, 5 + 1e-9] }],
        branchCurrents: [{ id: 'C1', values: [0, 1e-7] }]
      }
    };

    expect(resolveCapacitorBranchCurrent(doc, 'C1', res, 1, 1e-7)).toBe(0);
  });

  it('animates cap branch wires when only voltage-derived C1 current is available', () => {
    const doc = createLedFadePreset();
    const nettled = assignNets(doc);
    const cap = nettled.components.find((c) => c.id === 'C1')!;
    const na = cap.pins['a']!.net;
    const nb = cap.pins['b']!.net;

    const res: SimulateResponse = {
      schemaVersion: 1,
      ok: true,
      analysisType: 'tran',
      errors: [],
      warnings: [],
      tran: {
        time: [0, 0.002, 0.004],
        nodeVoltages: [
          { id: na, values: [0, 0.8, 1.6] },
          { id: nb, values: [0, 0, 0] }
        ],
        branchCurrents: [
          { id: 'C1', values: [0, 0, 0] },
          { id: 'D1', values: [0, 0.008, 0.008] },
          { id: 'R1', values: [0, 0.008, 0.008] }
        ]
      }
    };

    const currentOf = (id: string): number | null => {
      if (id === 'C1') return resolveCapacitorBranchCurrent(doc, id, res, 1, 0);
      const s = res.tran!.branchCurrents.find((x) => x.id === id);
      return s?.values[1] ?? null;
    };

    const currents = estimateAllWireCurrents(doc.components, doc.wires, currentOf);
    expect(Math.abs(currents.get('W3') ?? 0)).toBeGreaterThan(1e-4);
    expect(Math.abs(currents.get('W4') ?? 0)).toBeGreaterThan(1e-4);
  });
});

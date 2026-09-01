import { createLedPreset } from '../../lab/data/presets/led-series.preset';
import { checkLabCriteria } from './lab-challenge-checker';

describe('lab-challenge-checker', () => {
  it('passes sim_ok when simulation succeeded', () => {
    const doc = createLedPreset();
    const results = checkLabCriteria(
      [{ id: 1, order: 1, labelKey: 'x', type: 'sim_ok', paramsJson: '{}' }],
      { doc, result: { schemaVersion: 1, ok: true, analysisType: 'dcOp', errors: [], warnings: [] }, analysisMode: 'dcOp' }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('checks branch_current_min against dcOp currents', () => {
    const doc = createLedPreset();
    const results = checkLabCriteria(
      [
        {
          id: 2,
          order: 1,
          labelKey: 'x',
          type: 'branch_current_min',
          paramsJson: JSON.stringify({ refId: 'D1', minAmps: 0.005 })
        }
      ],
      {
        doc,
        result: {
          schemaVersion: 1,
          ok: true,
          analysisType: 'dcOp',
          errors: [],
          warnings: [],
          dcOp: { nodeVoltages: {}, branchCurrents: { D1: 0.01 } }
        },
        analysisMode: 'dcOp'
      }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('checks has_models for required parts', () => {
    const doc = {
      groundNet: 'gnd',
      components: [
        { id: 'B1', modelKey: 'battery', x: 0, y: 0, rotation: 0 as const, params: {}, pins: {} },
        { id: 'D1', modelKey: 'led', x: 0, y: 0, rotation: 0 as const, params: {}, pins: {} }
      ],
      wires: []
    };
    const results = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'has_models',
          paramsJson: JSON.stringify({ models: ['battery', 'led', 'resistor'] })
        }
      ],
      { doc, result: null, analysisMode: 'dcOp' }
    );
    expect(results[0].passed).toBeFalse();
  });
});

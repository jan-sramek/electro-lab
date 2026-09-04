import { assignNets } from '../../lab/data/schematic.model';
import { createLedPreset } from '../../lab/data/presets/led-series.preset';
import { createBjtSwitchPreset } from '../../lab/data/presets/bjt-switch.preset';
import { createBuzzerButtonPreset } from '../../lab/data/presets/buzzer-button.preset';
import { createPotDividerPreset } from '../../lab/data/presets/pot-divider.preset';
import { createVoltageDividerPreset } from '../../lab/data/presets/voltage-divider.preset';
import { checkLabCriteria, modelKeyMatches } from './lab-challenge-checker';

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

  it('matches BC547 when challenge asks for bjt_npn', () => {
    expect(modelKeyMatches('bc547', 'bjt_npn')).toBeTrue();
    const doc = createBjtSwitchPreset();
    const results = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'has_models',
          paramsJson: JSON.stringify({ models: ['bjt_npn', 'led'] })
        }
      ],
      { doc, result: null, analysisMode: 'dcOp' }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('matches pushbutton when challenge asks for switch', () => {
    expect(modelKeyMatches('pushbutton', 'switch')).toBeTrue();
    const doc = createBuzzerButtonPreset();
    const results = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'has_models',
          paramsJson: JSON.stringify({ models: ['buzzer', 'pushbutton'] })
        }
      ],
      { doc, result: null, analysisMode: 'dcOp' }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('checks pin DC voltage between bounds', () => {
    const doc = assignNets(createVoltageDividerPreset());
    const midNet = doc.components.find((c) => c.id === 'JM')?.pins['j']?.net;
    expect(midNet).toBeTruthy();
    const results = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'any_pin_dc_voltage_between',
          paramsJson: JSON.stringify({ modelKey: 'resistor', pin: 'b', minVolts: 2, maxVolts: 3 })
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
          dcOp: { nodeVoltages: { [midNet!]: 2.5, gnd: 0 }, branchCurrents: {} }
        },
        analysisMode: 'dcOp'
      }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('checks pot wiper voltage and not-burned parts', () => {
    const doc = assignNets(createPotDividerPreset());
    const wNet = doc.components.find((c) => c.id === 'POT1')?.pins['w']?.net;
    expect(wNet).toBeTruthy();
    const ok = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'any_pin_dc_voltage_between',
          paramsJson: JSON.stringify({ modelKey: 'potentiometer', pin: 'w', minVolts: 0.5, maxVolts: 4.5 })
        },
        {
          id: 2,
          order: 2,
          labelKey: 'x',
          type: 'any_part_not_burned',
          paramsJson: JSON.stringify({ modelKey: 'potentiometer' })
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
          dcOp: { nodeVoltages: { [wNet!]: 1.5, gnd: 0 }, branchCurrents: {} }
        },
        analysisMode: 'dcOp'
      }
    );
    expect(ok.every((r) => r.passed)).toBeTrue();
  });
});

import { assignNets } from '../../lab/data/schematic.model';
import { createLedPreset } from '../../lab/data/presets/led-series.preset';
import { createBjtSwitchPreset } from '../../lab/data/presets/bjt-switch.preset';
import { createBuzzerButtonPreset } from '../../lab/data/presets/buzzer-button.preset';
import { createPotDividerPreset } from '../../lab/data/presets/pot-divider.preset';
import { createVoltageDividerPreset } from '../../lab/data/presets/voltage-divider.preset';
import { createRcStepPreset } from '../../lab/data/presets/rc-step.preset';
import { createSeriesLedsPreset } from '../../lab/data/presets/series-leds.preset';
import { checkLabCriteria, modelKeyMatches } from './lab-challenge-checker';
import { specCriteriaForCheck } from './learn-challenge-spec';

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

  it('led-burn-limit overlay uses current max instead of shared LED min', () => {
    const criteria = specCriteriaForCheck('led', [], 'led-burn-limit');
    expect(criteria.some((c) => c.type === 'any_model_current_max')).toBeTrue();
    expect(criteria.some((c) => c.type === 'any_part_not_burned')).toBeTrue();
    expect(criteria.some((c) => c.type === 'any_model_current_min')).toBeFalse();
  });

  it('checks capacitor final voltage from pin nets (not component id)', () => {
    const doc = assignNets(createRcStepPreset());
    const cap = doc.components.find((c) => c.modelKey === 'capacitor');
    expect(cap).toBeTruthy();
    const na = cap!.pins['a']?.net;
    const nb = cap!.pins['b']?.net;
    expect(na && nb).toBeTruthy();
    const results = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'any_cap_voltage_final_min',
          paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 0.5 })
        }
      ],
      {
        doc,
        result: {
          schemaVersion: 1,
          ok: true,
          analysisType: 'tran',
          errors: [],
          warnings: [],
          tran: {
            time: [0, 0.01],
            nodeVoltages: [
              { id: na!, values: [0, 4.2] },
              ...(nb === doc.groundNet ? [] : [{ id: nb!, values: [0, 0] }])
            ],
            branchCurrents: []
          }
        },
        analysisMode: 'tran'
      }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('checks AC magnitude on a pin net', () => {
    const doc = assignNets(createRcStepPreset());
    const cap = doc.components.find((c) => c.modelKey === 'capacitor');
    const na = cap!.pins['a']?.net!;
    const results = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'any_pin_ac_mag_between',
          paramsJson: JSON.stringify({ modelKey: 'capacitor', pin: 'a', minMag: 0.2, maxMag: 2 })
        }
      ],
      {
        doc,
        result: {
          schemaVersion: 1,
          ok: true,
          analysisType: 'ac',
          errors: [],
          warnings: [],
          ac: {
            points: [{ frequency: 1000, nodeVoltages: { [na]: { mag: 0.7, phaseDeg: -45 } }, branchCurrents: {} }]
          }
        },
        analysisMode: 'ac'
      }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('checks transient peak voltage on a pin net', () => {
    const doc = assignNets(createRcStepPreset());
    const cap = doc.components.find((c) => c.modelKey === 'capacitor');
    const na = cap!.pins['a']?.net!;
    const results = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'any_pin_tran_peak_min',
          paramsJson: JSON.stringify({ modelKey: 'capacitor', pin: 'a', minVolts: 3 })
        }
      ],
      {
        doc,
        result: {
          schemaVersion: 1,
          ok: true,
          analysisType: 'tran',
          errors: [],
          warnings: [],
          tran: {
            time: [0, 0.005, 0.01],
            nodeVoltages: [{ id: na, values: [0, 2.1, 4.5] }],
            branchCurrents: []
          }
        },
        analysisMode: 'tran'
      }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('checks model min count', () => {
    const doc = createSeriesLedsPreset();
    const results = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'any_model_min_count',
          paramsJson: JSON.stringify({ modelKey: 'led', min: 2 })
        }
      ],
      { doc, result: null, analysisMode: 'dcOp' }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('checks transient peak-to-peak voltage', () => {
    const doc = assignNets(createRcStepPreset());
    const cap = doc.components.find((c) => c.modelKey === 'capacitor');
    const na = cap!.pins['a']?.net!;
    const results = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'any_pin_tran_peak_to_peak_min',
          paramsJson: JSON.stringify({ modelKey: 'capacitor', pin: 'a', minVolts: 1 })
        }
      ],
      {
        doc,
        result: {
          schemaVersion: 1,
          ok: true,
          analysisType: 'tran',
          errors: [],
          warnings: [],
          tran: {
            time: [0, 0.01, 0.02],
            nodeVoltages: [{ id: na, values: [4.0, 3.2, 4.5] }],
            branchCurrents: []
          }
        },
        analysisMode: 'tran'
      }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('checks transient branch current peak', () => {
    const doc = createLedPreset();
    const results = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'any_model_tran_current_peak_min',
          paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.01 })
        }
      ],
      {
        doc,
        result: {
          schemaVersion: 1,
          ok: true,
          analysisType: 'tran',
          errors: [],
          warnings: [],
          tran: {
            time: [0, 0.001],
            nodeVoltages: [],
            branchCurrents: [{ id: 'D1', values: [0, 0.02] }]
          }
        },
        analysisMode: 'tran'
      }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('treats diagnostic warnings as non-blocking for no_circuit_errors', () => {
    const doc = createRcStepPreset();
    const results = checkLabCriteria(
      [{ id: 1, order: 1, labelKey: 'x', type: 'no_circuit_errors', paramsJson: '{}' }],
      { doc, result: null, analysisMode: 'dcOp' }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('fails no_circuit_errors on a real wiring error', () => {
    const doc = createLedPreset();
    const broken = {
      ...doc,
      wires: doc.wires.filter((w) => w.id !== 'W1')
    };
    const results = checkLabCriteria(
      [{ id: 1, order: 1, labelKey: 'x', type: 'no_circuit_errors', paramsJson: '{}' }],
      { doc: broken, result: null, analysisMode: 'dcOp' }
    );
    expect(results[0].passed).toBeFalse();
  });

  it('checks any_switch_closed when a switch is closed', () => {
    const doc = createBjtSwitchPreset();
    const results = checkLabCriteria(
      [{ id: 1, order: 1, labelKey: 'x', type: 'any_switch_closed', paramsJson: '{}' }],
      { doc, result: null, analysisMode: 'dcOp' }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('checks any_pushbutton_pressed only for pushbutton parts', () => {
    const closed = {
      ...createBuzzerButtonPreset(),
      components: createBuzzerButtonPreset().components.map((c) =>
        c.modelKey === 'pushbutton' ? { ...c, params: { ...c.params, closed: true } } : c
      )
    };
    const results = checkLabCriteria(
      [{ id: 1, order: 1, labelKey: 'x', type: 'any_pushbutton_pressed', paramsJson: '{}' }],
      { doc: closed, result: null, analysisMode: 'dcOp' }
    );
    expect(results[0].passed).toBeTrue();
  });

  it('checks min_wire_count', () => {
    const doc = createLedPreset();
    const pass = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'min_wire_count',
          paramsJson: JSON.stringify({ min: 2 })
        }
      ],
      { doc, result: null, analysisMode: 'dcOp' }
    );
    const fail = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'min_wire_count',
          paramsJson: JSON.stringify({ min: 999 })
        }
      ],
      { doc, result: null, analysisMode: 'dcOp' }
    );
    expect(pass[0].passed).toBeTrue();
    expect(fail[0].passed).toBeFalse();
  });

  it('fails analysis_mode when Lab mode does not match', () => {
    const doc = createLedPreset();
    const results = checkLabCriteria(
      [
        {
          id: 1,
          order: 1,
          labelKey: 'x',
          type: 'analysis_mode',
          paramsJson: JSON.stringify({ mode: 'tran' })
        }
      ],
      { doc, result: null, analysisMode: 'dcOp' }
    );
    expect(results[0].passed).toBeFalse();
  });
});

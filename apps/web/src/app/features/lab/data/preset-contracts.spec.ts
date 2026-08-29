import { compileNetlist } from './schematic.model';
import { createLedPreset } from './presets/led-series.preset';
import { createRcStepPreset } from './presets/rc-step.preset';
import { createPotDividerPreset } from './presets/pot-divider.preset';
import { createPulseRcPreset } from './presets/pulse-rc.preset';
import { diagnoseSchematic } from './circuit-diagnostics';

describe('Lab preset contracts', () => {
  it('compiles LED preset with expected models', () => {
    const circuit = compileNetlist(createLedPreset());
    expect(circuit.ground).toBe('gnd');
    const models = circuit.elements.map((e) => e.model).sort();
    expect(models).toEqual(['battery', 'led', 'resistor', 'switch'].sort());
    expect(circuit.elements.every((e) => Object.keys(e.pins).length >= 2)).toBeTrue();
  });

  it('compiles RC preset for transient', () => {
    const circuit = compileNetlist(createRcStepPreset());
    expect(circuit.elements.some((e) => e.model === 'capacitor')).toBeTrue();
    expect(circuit.elements.some((e) => e.model === 'resistor')).toBeTrue();
  });

  it('compiles pot and pulse presets', () => {
    const pot = compileNetlist(createPotDividerPreset());
    expect(pot.elements.some((e) => e.model === 'potentiometer')).toBeTrue();
    const pulse = compileNetlist(createPulseRcPreset());
    expect(pulse.elements.some((e) => e.model === 'pulse_source')).toBeTrue();
  });

  it('flags shorted voltage source', () => {
    const doc = createLedPreset();
    // Force V1 pins onto same net by wiring p and n together via shared wire path — use assignNets after connecting p-n.
    const shorted = {
      ...doc,
      wires: [
        ...doc.wires,
        { id: 'WSHORT', a: { componentId: 'V1', pin: 'p' }, b: { componentId: 'V1', pin: 'n' } }
      ]
    };
    const diags = diagnoseSchematic(shorted, 'dcOp');
    expect(diags.some((d) => d.code === 'shorted_voltage_source')).toBeTrue();
  });
});

import { compileNetlist } from './schematic.model';
import { createLedPreset } from './presets/led-series.preset';
import { ledColorById } from './led-colors';

describe('led-colors', () => {
  it('maps each color id to a teaching Vf', () => {
    expect(ledColorById(0).vf).toBe(2.0);
    expect(ledColorById(1).vf).toBe(2.1);
    expect(ledColorById(3).vf).toBe(3.0);
  });

  it('omits schematic color param from engine netlist', () => {
    const circuit = compileNetlist(createLedPreset());
    const led = circuit.elements.find((e) => e.model === 'led');
    expect(led).toBeTruthy();
    expect(led!.params['color']).toBeUndefined();
    expect(led!.params['vf']).toBe(2);
  });
});

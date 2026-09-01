import { createLedFadePreset } from './presets/led-fade.preset';
import {
  RC_TRAN_TEACHING_DT,
  RC_TRAN_TEACHING_TSTOP,
  isRcFadeTeachingCircuit,
  recommendedRcTranSettings
} from './rc-tran-defaults';
import { createComponent, assignNets } from './schematic.model';

describe('rc-tran-defaults', () => {
  it('detects LED fade style teaching circuits', () => {
    expect(isRcFadeTeachingCircuit(createLedFadePreset())).toBeTrue();
  });

  it('ignores RC networks without a controllable switch', () => {
    const doc = assignNets({
      groundNet: 'gnd',
      components: [
        createComponent('battery', 0, 0, 'V1'),
        createComponent('resistor', 100, 0, 'R1'),
        createComponent('capacitor', 200, 0, 'C1'),
        createComponent('ground', 0, 100, 'GND1')
      ],
      wires: []
    });
    expect(isRcFadeTeachingCircuit(doc)).toBeFalse();
  });

  it('recommends teaching tStop/dt for new-tab defaults', () => {
    const rec = recommendedRcTranSettings(0.005, 5e-5)!;
    expect(rec.tStop).toBe(RC_TRAN_TEACHING_TSTOP);
    expect(rec.dt).toBe(RC_TRAN_TEACHING_DT);
  });

  it('keeps user tStop when already long enough', () => {
    const rec = recommendedRcTranSettings(12, 0.002);
    expect(rec).toBeNull();
  });
});

import { equalizeSeriesBranchCurrent } from './series-branch-current';
import { createLedFadePreset } from './presets/led-fade.preset';

describe('equalizeSeriesBranchCurrent', () => {
  it('copies resistor current onto the LED when the LED reports early cutoff zero', () => {
    const doc = createLedFadePreset();
    const currentOf = (id: string): number | null => {
      if (id === 'R1') return 0.004;
      if (id === 'D1') return 0;
      if (id === 'C1') return -0.004;
      return null;
    };
    const iLed = equalizeSeriesBranchCurrent(doc, 'D1', 0, currentOf);
    expect(Math.abs(iLed!)).toBeCloseTo(0.004, 6);
  });

  it('copies LED current onto the resistor when magnitudes disagree', () => {
    const doc = createLedFadePreset();
    const currentOf = (id: string): number | null => {
      if (id === 'R1') return 0.001;
      if (id === 'D1') return 0.004;
      return null;
    };
    const iR = equalizeSeriesBranchCurrent(doc, 'R1', 0.001, currentOf);
    expect(Math.abs(iR!)).toBeCloseTo(0.004, 6);
  });

  it('leaves unrelated parts unchanged', () => {
    const doc = createLedFadePreset();
    const currentOf = (id: string): number | null => (id === 'V1' ? 0 : null);
    expect(equalizeSeriesBranchCurrent(doc, 'V1', 0.01, currentOf)).toBe(0.01);
  });
});

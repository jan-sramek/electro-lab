import { createLedFadePreset } from './presets/led-fade.preset';
import { electricalSimKey } from './cap-ic';

describe('electricalSimKey', () => {
  it('ignores component x/y position', () => {
    const doc = createLedFadePreset();
    const keyA = electricalSimKey(doc, 'tran', 6, 0.002, 1000, false);
    const moved = {
      ...doc,
      components: doc.components.map((c) => ({ ...c, x: c.x + 120, y: c.y + 80 }))
    };
    const keyB = electricalSimKey(moved, 'tran', 6, 0.002, 1000, false);
    expect(keyB).toBe(keyA);
  });

  it('changes when a component param changes', () => {
    const doc = createLedFadePreset();
    const keyA = electricalSimKey(doc, 'tran', 6, 0.002, 1000, false);
    const tuned = {
      ...doc,
      components: doc.components.map((c) =>
        c.modelKey === 'capacitor' ? { ...c, params: { ...c.params, c: 0.01 } } : c
      )
    };
    const keyB = electricalSimKey(tuned, 'tran', 6, 0.002, 1000, false);
    expect(keyB).not.toBe(keyA);
  });
});

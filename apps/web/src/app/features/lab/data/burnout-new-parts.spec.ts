import { burnKindOf, canBurnOut, ldrResistanceOhms } from './burnout';

describe('new-part burnout seams', () => {
  it('marks buzzer, motor, and LDR as burnable (not pushbutton / arduino)', () => {
    expect(canBurnOut('buzzer')).toBeTrue();
    expect(canBurnOut('dc_motor')).toBeTrue();
    expect(canBurnOut('ldr')).toBeTrue();
    expect(canBurnOut('pushbutton')).toBeFalse();
    expect(canBurnOut('arduino_dio')).toBeFalse();
    expect(burnKindOf('buzzer')).toBe('buzzer');
    expect(burnKindOf('dc_motor')).toBe('dc_motor');
    expect(burnKindOf('ldr')).toBe('ldr');
  });

  it('ldrResistanceOhms matches dark/light extremes', () => {
    expect(ldrResistanceOhms({ light: 0, rDark: 100000, rLight: 1000 })).toBe(100000);
    expect(ldrResistanceOhms({ light: 1, rDark: 100000, rLight: 1000 })).toBe(1000);
  });
});

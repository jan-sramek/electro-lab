import {
  AMMETER_BURN_A,
  BUZZER_BURN_A,
  DIODE_BURN_A,
  MOTOR_BURN_A,
  RESISTOR_BURN_W,
  burnKindOf,
  canBurnOut
} from './burnout';
import { LED_BURN_A } from './led-limits';

describe('burnout thresholds', () => {
  it('keeps documented teaching limits stable', () => {
    expect(LED_BURN_A).toBe(0.035);
    expect(DIODE_BURN_A).toBe(0.1);
    expect(RESISTOR_BURN_W).toBe(0.25);
    expect(AMMETER_BURN_A).toBe(0.2);
    expect(BUZZER_BURN_A).toBe(0.05);
    expect(MOTOR_BURN_A).toBe(0.4);
  });

  it('maps common parts to burn kinds', () => {
    expect(burnKindOf('led')).toBe('led');
    expect(burnKindOf('resistor')).toBe('resistor');
    expect(burnKindOf('capacitor')).toBe('capacitor');
    expect(burnKindOf('fuse')).toBe('fuse');
    expect(burnKindOf('zener')).toBe('diode');
    expect(canBurnOut('fuse')).toBeTrue();
    expect(canBurnOut('ground')).toBeFalse();
  });
});

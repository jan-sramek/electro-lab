import {
  AMMETER_BURN_A,
  BUZZER_BURN_A,
  CAP_DEFAULT_VMAX,
  DIODE_BURN_A,
  MOTOR_BURN_A,
  RESISTOR_BURN_W,
  burnKindOf,
  burnWarningKey,
  canBurnOut
} from './burnout';
import { LED_BURN_A } from './led-limits';
import { BJT_BASE_BURN_A } from './bjt-limits';
import { NE555_OUT_BURN_A, NE555_VCC_BURN_V, NMOS_DRAIN_BURN_A, NMOS_VGS_BURN_V } from './nmos-limits';

describe('burnout thresholds', () => {
  it('keeps documented teaching limits stable', () => {
    expect(LED_BURN_A).toBe(0.035);
    expect(DIODE_BURN_A).toBe(0.1);
    expect(RESISTOR_BURN_W).toBe(0.25);
    expect(CAP_DEFAULT_VMAX).toBe(16);
    expect(AMMETER_BURN_A).toBe(0.2);
    expect(BUZZER_BURN_A).toBe(0.05);
    expect(MOTOR_BURN_A).toBe(0.4);
    expect(BJT_BASE_BURN_A).toBe(0.025);
    expect(NMOS_DRAIN_BURN_A).toBe(0.5);
    expect(NMOS_VGS_BURN_V).toBe(20);
    expect(NE555_OUT_BURN_A).toBe(0.2);
    expect(NE555_VCC_BURN_V).toBe(18);
  });

  it('maps common parts to burn kinds', () => {
    expect(burnKindOf('led')).toBe('led');
    expect(burnKindOf('resistor')).toBe('resistor');
    expect(burnKindOf('capacitor')).toBe('capacitor');
    expect(burnKindOf('fuse')).toBe('fuse');
    expect(burnKindOf('zener')).toBe('diode');
    expect(burnKindOf('bc547')).toBe('bjt');
    expect(burnKindOf('bjt_npn')).toBe('bjt');
    expect(burnKindOf('nmos')).toBe('nmos');
    expect(burnKindOf('ne555')).toBe('ne555');
    expect(canBurnOut('fuse')).toBeTrue();
    expect(canBurnOut('nmos')).toBeTrue();
    expect(canBurnOut('ne555')).toBeTrue();
    expect(canBurnOut('ground')).toBeFalse();
    expect(burnWarningKey('bjt')).toBe('lab.bjt.burnedWarning');
    expect(burnWarningKey('nmos')).toBe('lab.nmos.burnedWarning');
  });
});

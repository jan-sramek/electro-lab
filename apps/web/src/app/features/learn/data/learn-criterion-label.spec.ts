import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LearnLabCriterionDto } from '../api/learning-api.types';
import { criterionText, formatAmps, formatVolts } from './learn-criterion-label';

const crit = (type: string, params: Record<string, unknown>): LearnLabCriterionDto => ({
  id: 1,
  order: 1,
  labelKey: `learn.challenge.check.${type}`,
  type,
  paramsJson: JSON.stringify(params)
});

describe('criterionText', () => {
  let i18n: I18nService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    i18n = TestBed.inject(I18nService);
  });

  it('formats currents and voltages with sensible units', () => {
    expect(formatAmps(0.008)).toBe('8 mA');
    expect(formatAmps(0.0136)).toBe('13.6 mA');
    expect(formatAmps(0.0005)).toBe('500 µA');
    expect(formatVolts(2.25)).toBe('2.25 V');
    expect(formatVolts(5)).toBe('5 V');
  });

  it('renders concrete checklist lines with the criterion parameters', () => {
    expect(criterionText(crit('any_model_current_min', { modelKey: 'led', minAmps: 0.008 }), i18n)).toBe('LED current at least 8 mA.');
    expect(criterionText(crit('any_model_current_max', { modelKey: 'led', maxAmps: 0.02 }), i18n)).toBe('LED current at most 20 mA.');
    expect(criterionText(crit('any_model_min_count', { modelKey: 'resistor', min: 2 }), i18n)).toBe('At least 2 × Resistor.');
    expect(criterionText(crit('min_wire_count', { min: 4 }), i18n)).toBe('At least 4 wires in the circuit.');
    expect(criterionText(crit('analysis_mode', { mode: 'tran' }), i18n)).toBe('Analysis mode set to Transient.');
    expect(
      criterionText(crit('any_pin_dc_voltage_between', { modelKey: 'resistor', pin: 'b', minVolts: 1.8, maxVolts: 2.7 }), i18n)
    ).toBe('Resistor pin b between 1.8 V and 2.7 V.');
    const parts = criterionText(crit('has_models', { models: ['battery', 'led', 'ground'] }), i18n);
    expect(parts.startsWith('Parts on the canvas: ')).toBeTrue();
    expect(parts).toContain('LED');
  });

  it('falls back to the generic label for unknown types', () => {
    const c = crit('some_future_type', {});
    expect(criterionText(c, i18n)).toBe(i18n.t(c.labelKey));
  });
});

import { ExamplePresetId } from '../../lab/services/lab-editor.store';
import { AnalysisMode } from '../../lab/data/schematic.model';
import { LearnLabCriterionDto } from '../api/learning-api.types';

export interface LearnChallengeLabSpec {
  tabNameKey: string;
  analysisMode: AnalysisMode;
  tStop?: number;
  dt?: number;
  initFromDc?: boolean;
  /** Pure checker criteria — model-agnostic (user assigns their own ids). */
  criteria: Omit<LearnLabCriterionDto, 'id' | 'order' | 'labelKey'>[];
}

const SPECS: Record<ExamplePresetId, LearnChallengeLabSpec> = {
  led: {
    tabNameKey: 'learn.challenge.tab.led',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'led', 'resistor', 'ground'] }) },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]
  },
  rc: {
    tabNameKey: 'learn.challenge.tab.rc',
    analysisMode: 'tran',
    tStop: 0.01,
    dt: 5e-5,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'resistor', 'capacitor', 'ground'] }) },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_cap_voltage_final_min', paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 0.5 }) }
    ]
  },
  ledFade: {
    tabNameKey: 'learn.challenge.tab.ledFade',
    analysisMode: 'tran',
    tStop: 2,
    dt: 0.002,
    initFromDc: true,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'led', 'resistor', 'capacitor', 'ground'] }) },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  bjt: {
    tabNameKey: 'learn.challenge.tab.bjt',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'bjt_npn', 'led', 'resistor', 'switch', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_switch_closed', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]
  },
  relay: {
    tabNameKey: 'learn.challenge.tab.relay',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'relay', 'diode', 'switch', 'led', 'resistor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_switch_closed', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]
  },
  nmos: {
    tabNameKey: 'learn.challenge.tab.nmos',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'nmos', 'led', 'resistor', 'switch', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_switch_closed', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]
  },
  motor: {
    tabNameKey: 'learn.challenge.tab.motor',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'nmos', 'motor', 'switch', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_switch_closed', paramsJson: '{}' }
    ]
  },
  ne555: {
    tabNameKey: 'learn.challenge.tab.ne555',
    analysisMode: 'tran',
    tStop: 0.1,
    dt: 5e-5,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'ne555', 'resistor', 'capacitor', 'led', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  pushbutton: {
    tabNameKey: 'learn.challenge.tab.pushbutton',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'pushbutton', 'led', 'resistor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_pushbutton_pressed', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]
  },
  ldr: {
    tabNameKey: 'learn.challenge.tab.ldr',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'ldr', 'nmos', 'led', 'resistor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]
  },
  buzzer: {
    tabNameKey: 'learn.challenge.tab.buzzer',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'buzzer', 'resistor', 'switch', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_switch_closed', paramsJson: '{}' }
    ]
  },
  arduino: {
    tabNameKey: 'learn.challenge.tab.arduino',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['arduino_dio', 'led', 'resistor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]
  },
  i2cOled: {
    tabNameKey: 'learn.challenge.tab.i2cOled',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['arduino_i2c', 'ssd1306', 'resistor', 'ground']
        })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'min_wire_count', paramsJson: JSON.stringify({ min: 4 }) }
    ]
  },
  pot: {
    tabNameKey: 'learn.challenge.tab.pot',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'pot', 'ground'] }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  pulse: {
    tabNameKey: 'learn.challenge.tab.pulse',
    analysisMode: 'tran',
    tStop: 0.01,
    dt: 5e-5,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'resistor', 'capacitor', 'ground'] }) },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  opamp: {
    tabNameKey: 'learn.challenge.tab.opamp',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'op_amp', 'resistor', 'ground'] }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  ac: {
    tabNameKey: 'learn.challenge.tab.ac',
    analysisMode: 'ac',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'resistor', 'capacitor', 'ground'] }) },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'ac' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  christmasTree: {
    tabNameKey: 'learn.challenge.tab.ne555',
    analysisMode: 'tran',
    tStop: 0.1,
    dt: 5e-5,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  }
};

export function getLearnChallengeSpec(exampleId: string): LearnChallengeLabSpec | null {
  return (SPECS as Record<string, LearnChallengeLabSpec>)[exampleId] ?? null;
}

/** Map spec criteria to DTOs for the checker (stable ids for API submit). */
export function specCriteriaForCheck(
  exampleId: string,
  apiCriteria: LearnLabCriterionDto[]
): LearnLabCriterionDto[] {
  const spec = getLearnChallengeSpec(exampleId);
  if (!spec) return apiCriteria;
  return spec.criteria.map((c, i) => ({
    id: apiCriteria[i]?.id ?? i + 1,
    order: i + 1,
    labelKey: `learn.challenge.check.${c.type}`,
    type: c.type,
    paramsJson: c.paramsJson
  }));
}

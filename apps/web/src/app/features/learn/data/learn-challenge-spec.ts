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
  ne555Pot: {
    tabNameKey: 'learn.challenge.tab.ne555',
    analysisMode: 'tran',
    tStop: 0.5,
    dt: 2e-4,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['battery', 'ne555', 'resistor', 'capacitor', 'potentiometer', 'led', 'ground']
        })
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
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['pulse_source', 'resistor', 'capacitor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  diodeDirection: {
    tabNameKey: 'learn.challenge.tab.diodeDirection',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'diode', 'led', 'resistor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]
  },
  seriesParallel: {
    tabNameKey: 'learn.challenge.tab.seriesParallel',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'led', 'resistor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
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
  opampFollower: {
    tabNameKey: 'learn.challenge.tab.opampFollower',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'op_amp', 'resistor', 'ground'] }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  opampNonInv: {
    tabNameKey: 'learn.challenge.tab.opampNonInv',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'op_amp', 'resistor', 'ground'] }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  opampComparator: {
    tabNameKey: 'learn.challenge.tab.opampComparator',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['battery', 'op_amp', 'potentiometer', 'resistor', 'led', 'ground']
        })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  opampSchmitt: {
    tabNameKey: 'learn.challenge.tab.opampSchmitt',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['battery', 'op_amp', 'potentiometer', 'resistor', 'led', 'ground']
        })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  opampSumming: {
    tabNameKey: 'learn.challenge.tab.opampSumming',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'op_amp', 'resistor', 'ground'] }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  opampIntegrator: {
    tabNameKey: 'learn.challenge.tab.opampIntegrator',
    analysisMode: 'tran',
    tStop: 0.03,
    dt: 5e-5,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['pulse_source', 'op_amp', 'resistor', 'capacitor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  opampDifferentiator: {
    tabNameKey: 'learn.challenge.tab.opampDifferentiator',
    analysisMode: 'tran',
    tStop: 0.03,
    dt: 5e-5,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['pulse_source', 'op_amp', 'resistor', 'capacitor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  opampActiveFilter: {
    tabNameKey: 'learn.challenge.tab.opampActiveFilter',
    analysisMode: 'ac',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['ac_source', 'op_amp', 'resistor', 'capacitor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'ac' }) },
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
    tabNameKey: 'learn.challenge.tab.christmasTree',
    analysisMode: 'tran',
    tStop: 0.1,
    dt: 5e-5,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  halfWave: {
    tabNameKey: 'learn.challenge.tab.halfWave',
    analysisMode: 'tran',
    tStop: 0.08,
    dt: 2e-4,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['ac_source', 'diode', 'resistor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  bridge: {
    tabNameKey: 'learn.challenge.tab.bridge',
    analysisMode: 'tran',
    tStop: 0.08,
    dt: 2e-4,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['ac_source', 'diode', 'resistor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  filterCap: {
    tabNameKey: 'learn.challenge.tab.filterCap',
    analysisMode: 'tran',
    tStop: 0.12,
    dt: 2e-4,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['ac_source', 'diode', 'capacitor', 'resistor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  zener: {
    tabNameKey: 'learn.challenge.tab.zener',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'zener', 'resistor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  vreg7805: {
    tabNameKey: 'learn.challenge.tab.vreg7805',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'vreg_7805', 'resistor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  reversePolarity: {
    tabNameKey: 'learn.challenge.tab.reversePolarity',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'diode', 'led', 'resistor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]
  },
  fuseProtect: {
    tabNameKey: 'learn.challenge.tab.fuseProtect',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'fuse', 'switch', 'resistor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  ripple: {
    tabNameKey: 'learn.challenge.tab.ripple',
    analysisMode: 'tran',
    tStop: 0.12,
    dt: 2e-4,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['ac_source', 'diode', 'capacitor', 'resistor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  buck: {
    tabNameKey: 'learn.challenge.tab.buck',
    analysisMode: 'tran',
    tStop: 0.01,
    dt: 2e-5,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['battery', 'nmos', 'inductor', 'diode', 'capacitor', 'resistor', 'ground']
        })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  boost: {
    tabNameKey: 'learn.challenge.tab.boost',
    analysisMode: 'tran',
    tStop: 0.01,
    dt: 2e-5,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['battery', 'nmos', 'inductor', 'diode', 'capacitor', 'resistor', 'ground']
        })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  rcLowPass: {
    tabNameKey: 'learn.challenge.tab.rcLowPass',
    analysisMode: 'ac',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['ac_source', 'resistor', 'capacitor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'ac' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  rcHighPass: {
    tabNameKey: 'learn.challenge.tab.rcHighPass',
    analysisMode: 'ac',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['ac_source', 'resistor', 'capacitor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'ac' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  rlcSeries: {
    tabNameKey: 'learn.challenge.tab.rlcSeries',
    analysisMode: 'ac',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['ac_source', 'resistor', 'inductor', 'capacitor', 'ground']
        })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'ac' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  bandPass: {
    tabNameKey: 'learn.challenge.tab.bandPass',
    analysisMode: 'ac',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['ac_source', 'resistor', 'inductor', 'capacitor', 'ground']
        })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'ac' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  notchFilter: {
    tabNameKey: 'learn.challenge.tab.notchFilter',
    analysisMode: 'ac',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['ac_source', 'resistor', 'inductor', 'capacitor', 'ground']
        })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'ac' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  voltageDivider: {
    tabNameKey: 'learn.challenge.tab.voltageDivider',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'resistor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  measureAc: {
    tabNameKey: 'learn.challenge.tab.measureAc',
    analysisMode: 'ac',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['ac_source', 'resistor', 'capacitor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'ac' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  motorPwm: {
    tabNameKey: 'learn.challenge.tab.motorPwm',
    analysisMode: 'tran',
    tStop: 0.01,
    dt: 2e-5,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['battery', 'pulse_source', 'nmos', 'dc_motor', 'diode', 'resistor', 'ground']
        })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  hBridge: {
    tabNameKey: 'learn.challenge.tab.hBridge',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'switch', 'dc_motor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  motorDirection: {
    tabNameKey: 'learn.challenge.tab.motorDirection',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'switch', 'dc_motor', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  pullUpDown: {
    tabNameKey: 'learn.challenge.tab.pullUpDown',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'resistor', 'switch', 'led', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  debounce: {
    tabNameKey: 'learn.challenge.tab.debounce',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['battery', 'resistor', 'switch', 'capacitor', 'nmos', 'led', 'ground']
        })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  ntcDivider: {
    tabNameKey: 'learn.challenge.tab.ntcDivider',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'resistor', 'potentiometer', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  pwmFilter: {
    tabNameKey: 'learn.challenge.tab.pwmFilter',
    analysisMode: 'tran',
    tStop: 0.02,
    dt: 5e-5,
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['pulse_source', 'resistor', 'capacitor', 'ground'] })
      },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  relayBjt: {
    tabNameKey: 'learn.challenge.tab.relayBjt',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['battery', 'bjt_npn', 'relay', 'diode', 'switch', 'led', 'resistor', 'ground']
        })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  estopRelay: {
    tabNameKey: 'learn.challenge.tab.estopRelay',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['battery', 'relay', 'diode', 'switch', 'led', 'resistor', 'ground']
        })
      },
      { type: 'sim_ok', paramsJson: '{}' }
    ]
  },
  industrial24v: {
    tabNameKey: 'learn.challenge.tab.industrial24v',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({
          models: ['battery', 'relay', 'diode', 'switch', 'led', 'resistor', 'ground']
        })
      },
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

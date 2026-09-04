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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_cap_voltage_final_min', paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 0.5 }) }
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
        paramsJson: JSON.stringify({ models: ['battery', 'nmos', 'dc_motor', 'diode', 'switch', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_switch_closed', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'dc_motor', minAmps: 0.05 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) },
      {
        type: 'any_pin_tran_peak_to_peak_min',
        paramsJson: JSON.stringify({ modelKey: 'led', pin: 'a', minVolts: 1.0 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) },
      {
        type: 'any_pin_tran_peak_to_peak_min',
        paramsJson: JSON.stringify({ modelKey: 'led', pin: 'a', minVolts: 1.0 })
      }
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
        paramsJson: JSON.stringify({ models: ['battery', 'buzzer', 'resistor', 'pushbutton', 'ground'] })
      },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_pushbutton_pressed', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'buzzer', minAmps: 0.005 }) }
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
      { type: 'min_wire_count', paramsJson: JSON.stringify({ min: 6 }) },
      { type: 'any_model_min_count', paramsJson: JSON.stringify({ modelKey: 'resistor', min: 2 }) },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'resistor', pin: 'b', minVolts: 4.0, maxVolts: 5.5 })
      }
    ]
  },
  pot: {
    tabNameKey: 'learn.challenge.tab.pot',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'potentiometer', 'ground'] }) },
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'potentiometer', pin: 'w', minVolts: 0.5, maxVolts: 4.5 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_cap_voltage_final_min', paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 0.2 }) }
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
      { type: 'any_model_min_count', paramsJson: JSON.stringify({ modelKey: 'led', min: 2 }) },
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]
  },
  seriesLeds: {
    tabNameKey: 'learn.challenge.tab.seriesLeds',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      {
        type: 'has_models',
        paramsJson: JSON.stringify({ models: ['battery', 'led', 'resistor', 'ground'] })
      },
      { type: 'any_model_min_count', paramsJson: JSON.stringify({ modelKey: 'led', min: 2 }) },
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'op_amp', pin: 'out', minVolts: -11, maxVolts: -9 })
      }
    ]
  },
  opampFollower: {
    tabNameKey: 'learn.challenge.tab.opampFollower',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'op_amp', 'resistor', 'ground'] }) },
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'op_amp', pin: 'out', minVolts: 1.7, maxVolts: 2.3 })
      }
    ]
  },
  opampNonInv: {
    tabNameKey: 'learn.challenge.tab.opampNonInv',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'op_amp', 'resistor', 'ground'] }) },
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'op_amp', pin: 'out', minVolts: 4.5, maxVolts: 6.5 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'op_amp', pin: 'out', minVolts: 2.0, maxVolts: 15 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'op_amp', pin: 'out', minVolts: 2.0, maxVolts: 15 })
      }
    ]
  },
  opampSumming: {
    tabNameKey: 'learn.challenge.tab.opampSumming',
    analysisMode: 'dcOp',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'op_amp', 'resistor', 'ground'] }) },
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'op_amp', pin: 'out', minVolts: -2.0, maxVolts: -1.0 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_cap_voltage_final_min', paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 0.2 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_cap_voltage_final_min', paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 0.05 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_ac_mag_between',
        paramsJson: JSON.stringify({ modelKey: 'op_amp', pin: 'out', minMag: 0.05, maxMag: 20 })
      }
    ]
  },
  ac: {
    tabNameKey: 'learn.challenge.tab.ac',
    analysisMode: 'ac',
    criteria: [
      { type: 'no_circuit_errors', paramsJson: '{}' },
      { type: 'has_models', paramsJson: JSON.stringify({ models: ['ac_source', 'resistor', 'capacitor', 'ground'] }) },
      { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'ac' }) },
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_ac_mag_between',
        paramsJson: JSON.stringify({ modelKey: 'capacitor', pin: 'a', minMag: 0.4, maxMag: 0.95 })
      }
    ]
  },
  christmasTree: {
    tabNameKey: 'learn.challenge.tab.christmasTree',
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_min_count', paramsJson: JSON.stringify({ modelKey: 'led', min: 6 }) },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_tran_peak_min',
        paramsJson: JSON.stringify({ modelKey: 'resistor', pin: 'a', minVolts: 5 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_tran_peak_min',
        paramsJson: JSON.stringify({ modelKey: 'resistor', pin: 'a', minVolts: 5 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_cap_voltage_final_min', paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 0.5 }) },
      {
        type: 'any_pin_tran_peak_min',
        paramsJson: JSON.stringify({ modelKey: 'resistor', pin: 'a', minVolts: 4 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'zener', pin: 'c', minVolts: 4.5, maxVolts: 5.7 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'vreg_7805', pin: 'out', minVolts: 4.7, maxVolts: 5.3 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_part_not_burned', paramsJson: JSON.stringify({ modelKey: 'fuse' }) },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'resistor', minAmps: 0.01 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_cap_voltage_final_min', paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 0.5 }) },
      {
        type: 'any_pin_tran_peak_to_peak_min',
        paramsJson: JSON.stringify({ modelKey: 'resistor', pin: 'a', minVolts: 0.3 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_cap_voltage_final_min', paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 0.5 }) },
      { type: 'any_part_not_burned', paramsJson: JSON.stringify({ modelKey: 'nmos' }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_cap_voltage_final_min', paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 0.5 }) },
      { type: 'any_part_not_burned', paramsJson: JSON.stringify({ modelKey: 'nmos' }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_ac_mag_between',
        paramsJson: JSON.stringify({ modelKey: 'capacitor', pin: 'a', minMag: 0.4, maxMag: 0.95 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_ac_mag_between',
        paramsJson: JSON.stringify({ modelKey: 'resistor', pin: 'a', minMag: 0.4, maxMag: 0.95 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_ac_mag_between',
        paramsJson: JSON.stringify({ modelKey: 'capacitor', pin: 'a', minMag: 0.05, maxMag: 20 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_ac_mag_between',
        paramsJson: JSON.stringify({ modelKey: 'capacitor', pin: 'a', minMag: 0.02, maxMag: 20 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_ac_mag_between',
        paramsJson: JSON.stringify({ modelKey: 'resistor', pin: 'b', minMag: 0.02, maxMag: 5 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'resistor', pin: 'b', minVolts: 2.0, maxVolts: 3.0 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_ac_mag_between',
        paramsJson: JSON.stringify({ modelKey: 'capacitor', pin: 'a', minMag: 0.4, maxMag: 0.95 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_model_tran_current_peak_min',
        paramsJson: JSON.stringify({ modelKey: 'dc_motor', minAmps: 0.05 })
      },
      { type: 'any_part_not_burned', paramsJson: JSON.stringify({ modelKey: 'nmos' }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_min_count', paramsJson: JSON.stringify({ modelKey: 'switch', min: 4 }) },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'dc_motor', minAmps: 0.05 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_min_count', paramsJson: JSON.stringify({ modelKey: 'switch', min: 4 }) },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'dc_motor', minAmps: 0.05 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'min_wire_count', paramsJson: JSON.stringify({ min: 4 }) },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_min_count', paramsJson: JSON.stringify({ modelKey: 'capacitor', min: 1 }) },
      { type: 'min_wire_count', paramsJson: JSON.stringify({ min: 6 }) },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'resistor', pin: 'b', minVolts: 1.5, maxVolts: 3.5 })
      }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_cap_voltage_final_min', paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 1.0 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_switch_closed', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_model_min_count', paramsJson: JSON.stringify({ modelKey: 'switch', min: 2 }) },
      { type: 'any_switch_closed', paramsJson: '{}' },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
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
      { type: 'sim_ok', paramsJson: '{}' },
      { type: 'any_switch_closed', paramsJson: '{}' },
      {
        type: 'any_pin_dc_voltage_between',
        paramsJson: JSON.stringify({ modelKey: 'battery', pin: 'p', minVolts: 20, maxVolts: 28 })
      },
      { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
    ]
  }
};

/** Per-unit criteria when several units share one exampleId (e.g. LED path). */
const UNIT_CRITERIA: Record<string, LearnChallengeLabSpec['criteria']> = {
  'led-burn-limit': [
    { type: 'no_circuit_errors', paramsJson: '{}' },
    { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'led', 'resistor', 'ground'] }) },
    { type: 'sim_ok', paramsJson: '{}' },
    { type: 'any_model_current_max', paramsJson: JSON.stringify({ modelKey: 'led', maxAmps: 0.025 }) },
    { type: 'any_part_not_burned', paramsJson: JSON.stringify({ modelKey: 'led' }) }
  ],
  'divider-design': [
    { type: 'no_circuit_errors', paramsJson: '{}' },
    { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'resistor', 'ground'] }) },
    { type: 'sim_ok', paramsJson: '{}' },
    {
      type: 'any_pin_dc_voltage_between',
      paramsJson: JSON.stringify({ modelKey: 'resistor', pin: 'b', minVolts: 2.0, maxVolts: 3.0 })
    }
  ],
  'ohm-explore': [
    { type: 'no_circuit_errors', paramsJson: '{}' },
    { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'led', 'resistor', 'ground'] }) },
    { type: 'sim_ok', paramsJson: '{}' },
    { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.001 }) },
    { type: 'any_model_current_max', paramsJson: JSON.stringify({ modelKey: 'led', maxAmps: 0.025 }) },
    { type: 'any_part_not_burned', paramsJson: JSON.stringify({ modelKey: 'led' }) }
  ],
  'time-constant-estimate': [
    { type: 'no_circuit_errors', paramsJson: '{}' },
    { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'resistor', 'capacitor', 'ground'] }) },
    { type: 'analysis_mode', paramsJson: JSON.stringify({ mode: 'tran' }) },
    { type: 'sim_ok', paramsJson: '{}' },
    { type: 'any_cap_voltage_final_min', paramsJson: JSON.stringify({ modelKey: 'capacitor', minVolts: 2.0 }) }
  ],
  'inductive-why-diode': [
    { type: 'no_circuit_errors', paramsJson: '{}' },
    {
      type: 'has_models',
      paramsJson: JSON.stringify({ models: ['battery', 'relay', 'diode', 'switch', 'led', 'resistor', 'ground'] })
    },
    { type: 'sim_ok', paramsJson: '{}' },
    { type: 'any_switch_closed', paramsJson: '{}' },
    { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
  ],
  'fundamentals-loop': [
    { type: 'no_circuit_errors', paramsJson: '{}' },
    { type: 'has_models', paramsJson: JSON.stringify({ models: ['battery', 'led', 'resistor', 'ground'] }) },
    { type: 'sim_ok', paramsJson: '{}' },
    { type: 'min_wire_count', paramsJson: JSON.stringify({ min: 3 }) },
    { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
  ],
  'bjt-vs-mos-compare': [
    { type: 'no_circuit_errors', paramsJson: '{}' },
    {
      type: 'has_models',
      paramsJson: JSON.stringify({ models: ['battery', 'nmos', 'led', 'resistor', 'switch', 'ground'] })
    },
    { type: 'sim_ok', paramsJson: '{}' },
    { type: 'any_switch_closed', paramsJson: '{}' },
    { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) },
    { type: 'any_part_not_burned', paramsJson: JSON.stringify({ modelKey: 'nmos' }) }
  ],
  'motor-flyback': [
    { type: 'no_circuit_errors', paramsJson: '{}' },
    {
      type: 'has_models',
      paramsJson: JSON.stringify({ models: ['battery', 'nmos', 'dc_motor', 'diode', 'switch', 'ground'] })
    },
    { type: 'sim_ok', paramsJson: '{}' },
    { type: 'any_switch_closed', paramsJson: '{}' },
    { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'dc_motor', minAmps: 0.05 }) }
  ],
  'coil-protection': [
    { type: 'no_circuit_errors', paramsJson: '{}' },
    {
      type: 'has_models',
      paramsJson: JSON.stringify({ models: ['battery', 'relay', 'diode', 'switch', 'led', 'resistor', 'ground'] })
    },
    { type: 'sim_ok', paramsJson: '{}' },
    { type: 'any_switch_closed', paramsJson: '{}' },
    { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
  ],
  'pin-input-pulldown': [
    { type: 'no_circuit_errors', paramsJson: '{}' },
    {
      type: 'has_models',
      paramsJson: JSON.stringify({ models: ['arduino_dio', 'led', 'resistor', 'ground'] })
    },
    { type: 'sim_ok', paramsJson: '{}' },
    { type: 'min_wire_count', paramsJson: JSON.stringify({ min: 3 }) },
    { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'led', minAmps: 0.0005 }) }
  ],
  'motor-control': [
    { type: 'no_circuit_errors', paramsJson: '{}' },
    {
      type: 'has_models',
      paramsJson: JSON.stringify({ models: ['battery', 'nmos', 'dc_motor', 'diode', 'switch', 'ground'] })
    },
    { type: 'sim_ok', paramsJson: '{}' },
    { type: 'any_switch_closed', paramsJson: '{}' },
    { type: 'any_model_current_min', paramsJson: JSON.stringify({ modelKey: 'dc_motor', minAmps: 0.05 }) }
  ]
};

export function getLearnChallengeSpec(exampleId: string): LearnChallengeLabSpec | null {
  return (SPECS as Record<string, LearnChallengeLabSpec>)[exampleId] ?? null;
}

/** Map spec criteria to DTOs for the checker (stable ids for API submit). */
export function specCriteriaForCheck(
  exampleId: string,
  apiCriteria: LearnLabCriterionDto[],
  unitSlug?: string | null
): LearnLabCriterionDto[] {
  const overlay = unitSlug ? UNIT_CRITERIA[unitSlug] : undefined;
  const spec = getLearnChallengeSpec(exampleId);
  const criteria = overlay ?? spec?.criteria;
  if (!criteria) return apiCriteria;
  return criteria.map((c, i) => ({
    id: apiCriteria[i]?.id ?? i + 1,
    order: i + 1,
    labelKey: `learn.challenge.check.${c.type}`,
    type: c.type,
    paramsJson: c.paramsJson
  }));
}

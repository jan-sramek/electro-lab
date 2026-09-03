import { ExamplePresetId } from '../services/lab-editor.store';

/** Toolbar `<optgroup>` buckets — mirrors Learn modules where practical. */
export interface LabPresetGroup {
  /** i18n key for the optgroup label. */
  labelKey: string;
  ids: readonly ExamplePresetId[];
}

export const LAB_PRESET_GROUPS: readonly LabPresetGroup[] = [
  {
    labelKey: 'lab.toolbar.group.basics',
    ids: ['led', 'ledFade', 'rc', 'pot', 'pulse', 'voltageDivider']
  },
  {
    labelKey: 'lab.toolbar.group.power',
    ids: [
      'halfWave',
      'bridge',
      'filterCap',
      'zener',
      'vreg7805',
      'reversePolarity',
      'fuseProtect',
      'ripple',
      'buck',
      'boost'
    ]
  },
  {
    labelKey: 'lab.toolbar.group.opamps',
    ids: [
      'opampFollower',
      'opamp',
      'opampNonInv',
      'opampComparator',
      'opampSchmitt',
      'opampSumming',
      'opampIntegrator',
      'opampDifferentiator',
      'opampActiveFilter'
    ]
  },
  {
    labelKey: 'lab.toolbar.group.filters',
    ids: ['ac', 'rcLowPass', 'rcHighPass', 'rlcSeries', 'bandPass', 'notchFilter', 'measureAc', 'pwmFilter']
  },
  {
    labelKey: 'lab.toolbar.group.switching',
    ids: ['bjt', 'nmos', 'relay', 'relayBjt']
  },
  {
    labelKey: 'lab.toolbar.group.motors',
    ids: ['motor', 'motorPwm', 'hBridge', 'motorDirection']
  },
  {
    labelKey: 'lab.toolbar.group.timing',
    ids: ['ne555', 'ne555Pot', 'christmasTree']
  },
  {
    labelKey: 'lab.toolbar.group.input',
    ids: ['pushbutton', 'ldr', 'ntcDivider', 'pullUpDown', 'debounce']
  },
  {
    labelKey: 'lab.toolbar.group.actuators',
    ids: ['buzzer']
  },
  {
    labelKey: 'lab.toolbar.group.mcu',
    ids: ['arduino', 'i2cOled']
  },
  {
    labelKey: 'lab.toolbar.group.industrial',
    ids: ['estopRelay', 'industrial24v']
  }
];

export function presetOptionLabelKey(id: ExamplePresetId): string {
  return `lab.toolbar.${id}Preset`;
}

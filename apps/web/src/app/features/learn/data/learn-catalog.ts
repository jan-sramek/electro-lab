import { LearnModuleDef, LearnUnit } from './learn-catalog.model';

/**
 * Module order = unlock / hub order. `track` groups the hub into Starter (common
 * hobby path) vs Advanced (power, analog depth, MCU/buses).
 */
export const LEARN_MODULES: readonly LearnModuleDef[] = [
  { moduleSlug: 'basics', titleKey: 'learn.module.basics.title', order: 1, track: 'starter' },
  { moduleSlug: 'switching', titleKey: 'learn.module.switching.title', order: 2, track: 'starter' },
  { moduleSlug: 'input', titleKey: 'learn.module.input.title', order: 3, track: 'starter' },
  { moduleSlug: 'timing', titleKey: 'learn.module.timing.title', order: 4, track: 'starter' },
  { moduleSlug: 'actuators', titleKey: 'learn.module.actuators.title', order: 5, track: 'starter' },
  { moduleSlug: 'sensors', titleKey: 'learn.module.sensors.title', order: 6, track: 'starter' },
  { moduleSlug: 'digital', titleKey: 'learn.module.digital.title', order: 7, track: 'starter' },
  { moduleSlug: 'motors', titleKey: 'learn.module.motors.title', order: 8, track: 'advanced' },
  { moduleSlug: 'power', titleKey: 'learn.module.power.title', order: 9, track: 'advanced' },
  { moduleSlug: 'filters', titleKey: 'learn.module.filters.title', order: 10, track: 'advanced' },
  { moduleSlug: 'opamps', titleKey: 'learn.module.opamps.title', order: 11, track: 'advanced' },
  { moduleSlug: 'industrial', titleKey: 'learn.module.industrial.title', order: 12, track: 'advanced' },
  { moduleSlug: 'adc-dac', titleKey: 'learn.module.adcDac.title', order: 13, track: 'advanced' },
  { moduleSlug: 'mcu', titleKey: 'learn.module.mcu.title', order: 14, track: 'advanced' },
  { moduleSlug: 'buses', titleKey: 'learn.module.buses.title', order: 15, track: 'advanced' },
  { moduleSlug: 'comms', titleKey: 'learn.module.comms.title', order: 16, track: 'advanced' }
];

export const LEARN_UNITS: readonly LearnUnit[] = [
  // ── Starter: concepts → LED practice → dividers → RC → AC (harder, later) ──
  {
    unitSlug: 'voltage-intro',
    moduleSlug: 'basics',
    exampleId: 'led',
    i18nKeyPrefix: 'learn.project.voltageIntro',
    stepCount: 4,
    lab: false
  },
  {
    unitSlug: 'current-intro',
    moduleSlug: 'basics',
    exampleId: 'led',
    i18nKeyPrefix: 'learn.project.currentIntro',
    stepCount: 4,
    lab: false
  },
  {
    unitSlug: 'resistance-intro',
    moduleSlug: 'basics',
    exampleId: 'led',
    i18nKeyPrefix: 'learn.project.resistanceIntro',
    stepCount: 4,
    lab: false
  },
  {
    unitSlug: 'ohms-law',
    moduleSlug: 'basics',
    exampleId: 'led',
    i18nKeyPrefix: 'learn.project.ohmsLaw',
    stepCount: 4
  },
  {
    unitSlug: 'circuit-elements',
    moduleSlug: 'basics',
    exampleId: 'led',
    i18nKeyPrefix: 'learn.project.circuitElements',
    stepCount: 4,
    lab: false
  },
  {
    unitSlug: 'series-parallel-circuits',
    moduleSlug: 'basics',
    exampleId: 'seriesParallel',
    i18nKeyPrefix: 'learn.project.seriesParallelCircuits',
    stepCount: 4
  },
  {
    unitSlug: 'voltage-divider',
    moduleSlug: 'basics',
    exampleId: 'voltageDivider',
    i18nKeyPrefix: 'learn.project.voltageDivider',
    stepCount: 4
  },
  {
    unitSlug: 'divider-design',
    moduleSlug: 'basics',
    exampleId: 'voltageDivider',
    i18nKeyPrefix: 'learn.project.dividerDesign',
    stepCount: 4
  },
  {
    unitSlug: 'pot-divider',
    moduleSlug: 'basics',
    exampleId: 'pot',
    i18nKeyPrefix: 'learn.project.potDivider',
    stepCount: 4
  },
  {
    unitSlug: 'led-series',
    moduleSlug: 'basics',
    exampleId: 'led',
    i18nKeyPrefix: 'learn.project.led',
    stepCount: 4
  },
  {
    unitSlug: 'diode-direction',
    moduleSlug: 'basics',
    exampleId: 'diodeDirection',
    i18nKeyPrefix: 'learn.project.diodeDirection',
    stepCount: 4
  },
  {
    unitSlug: 'series-leds',
    moduleSlug: 'basics',
    exampleId: 'seriesLeds',
    i18nKeyPrefix: 'learn.project.seriesLeds',
    stepCount: 4
  },
  {
    unitSlug: 'led-burn-limit',
    moduleSlug: 'basics',
    exampleId: 'led',
    i18nKeyPrefix: 'learn.project.ledBurnLimit',
    stepCount: 4
  },
  {
    unitSlug: 'rc-charge',
    moduleSlug: 'basics',
    exampleId: 'rc',
    i18nKeyPrefix: 'learn.project.rc',
    stepCount: 4
  },
  {
    unitSlug: 'led-fade',
    moduleSlug: 'basics',
    exampleId: 'ledFade',
    i18nKeyPrefix: 'learn.project.ledFade',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'pulse-rc',
    moduleSlug: 'basics',
    exampleId: 'pulse',
    i18nKeyPrefix: 'learn.project.pulseRc',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'ac-dc',
    moduleSlug: 'basics',
    exampleId: 'measureAc',
    i18nKeyPrefix: 'learn.project.acDc',
    stepCount: 4,
    lab: false,
    optional: true
  },
  {
    unitSlug: 'basics-final-quiz',
    moduleSlug: 'basics',
    exampleId: 'led',
    i18nKeyPrefix: 'learn.project.basicsFinal',
    stepCount: 3,
    lab: false,
    finalQuiz: true
  },

  // ── Starter: transistors & relays ──
  {
    unitSlug: 'bjt-switch',
    moduleSlug: 'switching',
    exampleId: 'bjt',
    i18nKeyPrefix: 'learn.project.bc547',
    stepCount: 4
  },
  {
    unitSlug: 'nmos-switch',
    moduleSlug: 'switching',
    exampleId: 'nmos',
    i18nKeyPrefix: 'learn.project.nmos',
    stepCount: 4
  },
  {
    unitSlug: 'relay-flyback',
    moduleSlug: 'switching',
    exampleId: 'relay',
    i18nKeyPrefix: 'learn.project.relay',
    stepCount: 4
  },
  {
    unitSlug: 'inductive-why-diode',
    moduleSlug: 'switching',
    exampleId: 'relay',
    i18nKeyPrefix: 'learn.project.inductiveWhyDiode',
    stepCount: 4
  },
  {
    unitSlug: 'motor-lowside',
    moduleSlug: 'switching',
    exampleId: 'motor',
    i18nKeyPrefix: 'learn.project.motor',
    stepCount: 4
  },
  {
    unitSlug: 'bjt-vs-mos-compare',
    moduleSlug: 'switching',
    exampleId: 'nmos',
    i18nKeyPrefix: 'learn.project.bjtVsMos',
    stepCount: 4,
    optional: true
  },

  // ── Starter: buttons & nightlight ──
  {
    unitSlug: 'pushbutton-led',
    moduleSlug: 'input',
    exampleId: 'pushbutton',
    i18nKeyPrefix: 'learn.project.pushbutton',
    stepCount: 4
  },
  {
    unitSlug: 'ldr-nightlight',
    moduleSlug: 'input',
    exampleId: 'ldr',
    i18nKeyPrefix: 'learn.project.ldr',
    stepCount: 4
  },

  // ── Starter: timing ──
  {
    unitSlug: 'ne555-astable',
    moduleSlug: 'timing',
    exampleId: 'ne555',
    i18nKeyPrefix: 'learn.project.ne555',
    stepCount: 4
  },
  {
    unitSlug: 'ne555-pot-blink',
    moduleSlug: 'timing',
    exampleId: 'ne555Pot',
    i18nKeyPrefix: 'learn.project.ne555Pot',
    stepCount: 4
  },
  {
    unitSlug: 'ne555-play',
    moduleSlug: 'timing',
    exampleId: 'christmasTree',
    i18nKeyPrefix: 'learn.project.ne555Play',
    stepCount: 4,
    optional: true
  },

  // ── Starter: simple actuators ──
  {
    unitSlug: 'buzzer-button',
    moduleSlug: 'actuators',
    exampleId: 'buzzer',
    i18nKeyPrefix: 'learn.project.buzzer',
    stepCount: 4
  },
  {
    unitSlug: 'motor-control',
    moduleSlug: 'actuators',
    exampleId: 'motor',
    i18nKeyPrefix: 'learn.project.motorControl',
    stepCount: 4
  },

  // ── Starter: sensors ──
  {
    unitSlug: 'sensor-pot',
    moduleSlug: 'sensors',
    exampleId: 'pot',
    i18nKeyPrefix: 'learn.project.sensorPot',
    stepCount: 4
  },
  {
    unitSlug: 'sensor-ldr',
    moduleSlug: 'sensors',
    exampleId: 'ldr',
    i18nKeyPrefix: 'learn.project.sensorLdr',
    stepCount: 4
  },
  {
    unitSlug: 'sensor-ntc',
    moduleSlug: 'sensors',
    exampleId: 'ntcDivider',
    i18nKeyPrefix: 'learn.project.ntcDivider',
    stepCount: 4
  },
  {
    unitSlug: 'sensor-threshold',
    moduleSlug: 'sensors',
    exampleId: 'opampComparator',
    i18nKeyPrefix: 'learn.project.sensorThreshold',
    stepCount: 4,
    optional: true
  },

  // ── Starter: digital basics ──
  {
    unitSlug: 'pull-up-down',
    moduleSlug: 'digital',
    exampleId: 'pullUpDown',
    i18nKeyPrefix: 'learn.project.pullUpDown',
    stepCount: 4
  },
  {
    unitSlug: 'debounce',
    moduleSlug: 'digital',
    exampleId: 'debounce',
    i18nKeyPrefix: 'learn.project.debounce',
    stepCount: 4
  },
  {
    unitSlug: 'debounce-idea',
    moduleSlug: 'digital',
    exampleId: 'debounce',
    i18nKeyPrefix: 'learn.project.debounceIdea',
    stepCount: 4,
    optional: true
  },

  // ── Advanced: motors ──
  {
    unitSlug: 'motor-mosfet',
    moduleSlug: 'motors',
    exampleId: 'motor',
    i18nKeyPrefix: 'learn.project.motorMosfet',
    stepCount: 4
  },
  {
    unitSlug: 'motor-flyback',
    moduleSlug: 'motors',
    exampleId: 'motor',
    i18nKeyPrefix: 'learn.project.motorFlyback',
    stepCount: 4
  },
  {
    unitSlug: 'motor-pwm',
    moduleSlug: 'motors',
    exampleId: 'motorPwm',
    i18nKeyPrefix: 'learn.project.motorPwm',
    stepCount: 4
  },
  {
    unitSlug: 'motor-speed',
    moduleSlug: 'motors',
    exampleId: 'motorPwm',
    i18nKeyPrefix: 'learn.project.motorSpeed',
    stepCount: 4
  },
  {
    unitSlug: 'h-bridge',
    moduleSlug: 'motors',
    exampleId: 'hBridge',
    i18nKeyPrefix: 'learn.project.hBridge',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'motor-direction',
    moduleSlug: 'motors',
    exampleId: 'motorDirection',
    i18nKeyPrefix: 'learn.project.motorDirection',
    stepCount: 4,
    optional: true
  },

  // ── Advanced: power supplies (after diodes & switching) ──
  {
    unitSlug: 'reverse-polarity',
    moduleSlug: 'power',
    exampleId: 'reversePolarity',
    i18nKeyPrefix: 'learn.project.reversePolarity',
    stepCount: 4
  },
  {
    unitSlug: 'fuse-protection',
    moduleSlug: 'power',
    exampleId: 'fuseProtect',
    i18nKeyPrefix: 'learn.project.fuseProtect',
    stepCount: 4
  },
  {
    unitSlug: 'half-wave-rectifier',
    moduleSlug: 'power',
    exampleId: 'halfWave',
    i18nKeyPrefix: 'learn.project.halfWave',
    stepCount: 4
  },
  {
    unitSlug: 'bridge-rectifier',
    moduleSlug: 'power',
    exampleId: 'bridge',
    i18nKeyPrefix: 'learn.project.bridge',
    stepCount: 4
  },
  {
    unitSlug: 'filter-capacitor',
    moduleSlug: 'power',
    exampleId: 'filterCap',
    i18nKeyPrefix: 'learn.project.filterCap',
    stepCount: 4
  },
  {
    unitSlug: 'zener-regulator',
    moduleSlug: 'power',
    exampleId: 'zener',
    i18nKeyPrefix: 'learn.project.zener',
    stepCount: 4
  },
  {
    unitSlug: 'linear-7805',
    moduleSlug: 'power',
    exampleId: 'vreg7805',
    i18nKeyPrefix: 'learn.project.vreg7805',
    stepCount: 4
  },
  {
    unitSlug: 'ripple-measure',
    moduleSlug: 'power',
    exampleId: 'ripple',
    i18nKeyPrefix: 'learn.project.ripple',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'buck-converter',
    moduleSlug: 'power',
    exampleId: 'buck',
    i18nKeyPrefix: 'learn.project.buck',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'boost-converter',
    moduleSlug: 'power',
    exampleId: 'boost',
    i18nKeyPrefix: 'learn.project.boost',
    stepCount: 4,
    optional: true
  },

  // ── Advanced: filters (dividers live in basics now) ──
  {
    unitSlug: 'rc-low-pass',
    moduleSlug: 'filters',
    exampleId: 'rcLowPass',
    i18nKeyPrefix: 'learn.project.rcLowPass',
    stepCount: 4
  },
  {
    unitSlug: 'rc-high-pass',
    moduleSlug: 'filters',
    exampleId: 'rcHighPass',
    i18nKeyPrefix: 'learn.project.rcHighPass',
    stepCount: 4
  },
  {
    unitSlug: 'ac-rc-lpf',
    moduleSlug: 'filters',
    exampleId: 'ac',
    i18nKeyPrefix: 'learn.project.acRcLpf',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'measure-freq-amp',
    moduleSlug: 'filters',
    exampleId: 'measureAc',
    i18nKeyPrefix: 'learn.project.measureAc',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'rlc-series',
    moduleSlug: 'filters',
    exampleId: 'rlcSeries',
    i18nKeyPrefix: 'learn.project.rlcSeries',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'band-pass',
    moduleSlug: 'filters',
    exampleId: 'bandPass',
    i18nKeyPrefix: 'learn.project.bandPass',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'notch-filter',
    moduleSlug: 'filters',
    exampleId: 'notchFilter',
    i18nKeyPrefix: 'learn.project.notchFilter',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'bode-intuition',
    moduleSlug: 'filters',
    exampleId: 'measureAc',
    i18nKeyPrefix: 'learn.project.bodeIntuition',
    stepCount: 4,
    optional: true
  },

  // ── Advanced: op-amps ──
  {
    unitSlug: 'opamp-follower',
    moduleSlug: 'opamps',
    exampleId: 'opampFollower',
    i18nKeyPrefix: 'learn.project.opampFollower',
    stepCount: 4
  },
  {
    unitSlug: 'opamp-noninv',
    moduleSlug: 'opamps',
    exampleId: 'opampNonInv',
    i18nKeyPrefix: 'learn.project.opampNonInv',
    stepCount: 4
  },
  {
    unitSlug: 'opamp-invert',
    moduleSlug: 'opamps',
    exampleId: 'opamp',
    i18nKeyPrefix: 'learn.project.opamp',
    stepCount: 4
  },
  {
    unitSlug: 'opamp-comparator',
    moduleSlug: 'opamps',
    exampleId: 'opampComparator',
    i18nKeyPrefix: 'learn.project.opampComparator',
    stepCount: 4
  },
  {
    unitSlug: 'opamp-summing',
    moduleSlug: 'opamps',
    exampleId: 'opampSumming',
    i18nKeyPrefix: 'learn.project.opampSumming',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'opamp-schmitt',
    moduleSlug: 'opamps',
    exampleId: 'opampSchmitt',
    i18nKeyPrefix: 'learn.project.opampSchmitt',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'opamp-integrator',
    moduleSlug: 'opamps',
    exampleId: 'opampIntegrator',
    i18nKeyPrefix: 'learn.project.opampIntegrator',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'opamp-differentiator',
    moduleSlug: 'opamps',
    exampleId: 'opampDifferentiator',
    i18nKeyPrefix: 'learn.project.opampDifferentiator',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'opamp-active-filter',
    moduleSlug: 'opamps',
    exampleId: 'opampActiveFilter',
    i18nKeyPrefix: 'learn.project.opampActiveFilter',
    stepCount: 4,
    optional: true
  },

  // ── Advanced: industrial ──
  {
    unitSlug: 'relay-transistor',
    moduleSlug: 'industrial',
    exampleId: 'relayBjt',
    i18nKeyPrefix: 'learn.project.relayBjt',
    stepCount: 4
  },
  {
    unitSlug: 'coil-protection',
    moduleSlug: 'industrial',
    exampleId: 'relay',
    i18nKeyPrefix: 'learn.project.coilProtect',
    stepCount: 4
  },
  {
    unitSlug: 'mosfet-driver',
    moduleSlug: 'industrial',
    exampleId: 'nmos',
    i18nKeyPrefix: 'learn.project.mosfetDriver',
    stepCount: 4
  },
  {
    unitSlug: 'inductive-load',
    moduleSlug: 'industrial',
    exampleId: 'motor',
    i18nKeyPrefix: 'learn.project.inductiveLoad',
    stepCount: 4
  },
  {
    unitSlug: 'estop-principle',
    moduleSlug: 'industrial',
    exampleId: 'estopRelay',
    i18nKeyPrefix: 'learn.project.estopRelay',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'control-24v',
    moduleSlug: 'industrial',
    exampleId: 'industrial24v',
    i18nKeyPrefix: 'learn.project.industrial24v',
    stepCount: 4,
    optional: true
  },

  // ── Advanced: ADC / MCU / buses / comms ──
  {
    unitSlug: 'adc-front-end',
    moduleSlug: 'adc-dac',
    exampleId: 'pot',
    i18nKeyPrefix: 'learn.project.adcFrontEnd',
    stepCount: 4
  },
  {
    unitSlug: 'adc-reference',
    moduleSlug: 'adc-dac',
    exampleId: 'voltageDivider',
    i18nKeyPrefix: 'learn.project.adcReference',
    stepCount: 4
  },
  {
    unitSlug: 'pwm-pseudo-dac',
    moduleSlug: 'adc-dac',
    exampleId: 'pwmFilter',
    i18nKeyPrefix: 'learn.project.pwmFilter',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'arduino-dio-led',
    moduleSlug: 'mcu',
    exampleId: 'arduino',
    i18nKeyPrefix: 'learn.project.arduino',
    stepCount: 4
  },
  {
    unitSlug: 'pin-input-pulldown',
    moduleSlug: 'mcu',
    exampleId: 'arduino',
    i18nKeyPrefix: 'learn.project.pinInput',
    stepCount: 4
  },
  {
    unitSlug: 'i2c-oled-wiring',
    moduleSlug: 'buses',
    exampleId: 'i2cOled',
    i18nKeyPrefix: 'learn.project.i2cOled',
    stepCount: 4
  },
  {
    unitSlug: 'i2c-address-idea',
    moduleSlug: 'buses',
    exampleId: 'i2cOled',
    i18nKeyPrefix: 'learn.project.i2cAddress',
    stepCount: 4
  },
  {
    unitSlug: 'spi-vs-i2c',
    moduleSlug: 'buses',
    exampleId: 'i2cOled',
    i18nKeyPrefix: 'learn.project.spiVsI2c',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'i2c-multi-slave',
    moduleSlug: 'buses',
    exampleId: 'i2cOled',
    i18nKeyPrefix: 'learn.project.i2cMultiSlave',
    stepCount: 4,
    optional: true
  },
  {
    unitSlug: 'i2c-wiring',
    moduleSlug: 'comms',
    exampleId: 'i2cOled',
    i18nKeyPrefix: 'learn.project.commsI2c',
    stepCount: 4
  }
];

export function findLearnUnit(moduleSlug: string, unitSlug: string): LearnUnit | undefined {
  return LEARN_UNITS.find((u) => u.moduleSlug === moduleSlug && u.unitSlug === unitSlug);
}

/** Resolve `from` query param (`module/unit`) back to a catalog entry. */
export function parseLearnFromSlug(from: string): LearnUnit | undefined {
  const slash = from.indexOf('/');
  if (slash <= 0 || slash === from.length - 1) return undefined;
  return findLearnUnit(from.slice(0, slash), from.slice(slash + 1));
}

export function learnModulesWithUnits(): { module: LearnModuleDef; units: LearnUnit[] }[] {
  return [...LEARN_MODULES]
    .sort((a, b) => a.order - b.order)
    .map((module) => ({
      module,
      units: LEARN_UNITS.filter((u) => u.moduleSlug === module.moduleSlug)
    }))
    .filter((row) => row.units.length > 0);
}

/** Paths for Angular prerender (leading slash, no origin). */
export function learnPrerenderPaths(): string[] {
  return ['/learn', ...LEARN_UNITS.map((u) => `/learn/${u.moduleSlug}/${u.unitSlug}`)];
}

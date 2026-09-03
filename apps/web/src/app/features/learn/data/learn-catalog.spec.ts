import {
  LEARN_MODULES,
  LEARN_UNITS,
  findLearnUnit,
  learnPrerenderPaths,
  parseLearnFromSlug
} from './learn-catalog';
import type { ExamplePresetId } from '../../lab/services/lab-editor.store';

const VALID_EXAMPLE_IDS = new Set<ExamplePresetId>([
  'led',
  'ledFade',
  'rc',
  'pot',
  'pulse',
  'diodeDirection',
  'seriesParallel',
  'opamp',
  'opampFollower',
  'opampNonInv',
  'opampComparator',
  'opampSchmitt',
  'opampSumming',
  'opampIntegrator',
  'opampDifferentiator',
  'opampActiveFilter',
  'ac',
  'bjt',
  'relay',
  'nmos',
  'ne555',
  'ne555Pot',
  'christmasTree',
  'pushbutton',
  'ldr',
  'buzzer',
  'motor',
  'arduino',
  'i2cOled',
  'halfWave',
  'bridge',
  'filterCap',
  'zener',
  'vreg7805',
  'reversePolarity',
  'fuseProtect',
  'ripple',
  'buck',
  'boost',
  'rcLowPass',
  'rcHighPass',
  'rlcSeries',
  'bandPass',
  'notchFilter',
  'voltageDivider',
  'measureAc',
  'motorPwm',
  'hBridge',
  'motorDirection',
  'pullUpDown',
  'debounce',
  'ntcDivider',
  'pwmFilter',
  'relayBjt',
  'estopRelay',
  'industrial24v'
]);

describe('learn-catalog', () => {
  it('has unique moduleSlug + unitSlug pairs', () => {
    const keys = LEARN_UNITS.map((u) => `${u.moduleSlug}/${u.unitSlug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('maps every unit to a known Lab example preset', () => {
    for (const unit of LEARN_UNITS) {
      expect(unit.exampleId).withContext(unit.unitSlug).toBeTruthy();
      expect(VALID_EXAMPLE_IDS.has(unit.exampleId))
        .withContext(`${unit.unitSlug} → ${unit.exampleId}`)
        .toBeTrue();
    }
  });

  it('references defined modules', () => {
    const moduleSlugs = new Set(LEARN_MODULES.map((m) => m.moduleSlug));
    for (const unit of LEARN_UNITS) {
      expect(moduleSlugs.has(unit.moduleSlug)).withContext(unit.unitSlug).toBeTrue();
    }
  });

  it('findLearnUnit resolves catalog entries', () => {
    const unit = findLearnUnit('switching', 'bjt-switch');
    expect(unit?.exampleId).toBe('bjt');
    expect(findLearnUnit('switching', 'missing')).toBeUndefined();
  });

  it('parseLearnFromSlug round-trips module/unit slugs', () => {
    const unit = parseLearnFromSlug('buses/i2c-oled-wiring');
    expect(unit?.exampleId).toBe('i2cOled');
    expect(parseLearnFromSlug('bad')).toBeUndefined();
    expect(parseLearnFromSlug('only-module/')).toBeUndefined();
  });

  it('exports prerender paths for hub and each unit', () => {
    const paths = learnPrerenderPaths();
    expect(paths).toContain('/learn');
    expect(paths).toContain('/learn/buses/i2c-oled-wiring');
    expect(paths.length).toBe(LEARN_UNITS.length + 1);
  });
});

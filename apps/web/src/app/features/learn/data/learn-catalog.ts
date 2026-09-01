import { LearnModuleDef, LearnUnit } from './learn-catalog.model';

export const LEARN_MODULES: readonly LearnModuleDef[] = [
  { moduleSlug: 'basics', titleKey: 'learn.module.basics.title', order: 1 },
  { moduleSlug: 'switching', titleKey: 'learn.module.switching.title', order: 2 },
  { moduleSlug: 'timing', titleKey: 'learn.module.timing.title', order: 3 },
  { moduleSlug: 'input', titleKey: 'learn.module.input.title', order: 4 },
  { moduleSlug: 'actuators', titleKey: 'learn.module.actuators.title', order: 5 },
  { moduleSlug: 'mcu', titleKey: 'learn.module.mcu.title', order: 6 },
  { moduleSlug: 'buses', titleKey: 'learn.module.buses.title', order: 7 }
];

export const LEARN_UNITS: readonly LearnUnit[] = [
  {
    unitSlug: 'led-series',
    moduleSlug: 'basics',
    exampleId: 'led',
    i18nKeyPrefix: 'learn.project.led',
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
    stepCount: 4
  },
  {
    unitSlug: 'bjt-switch',
    moduleSlug: 'switching',
    exampleId: 'bjt',
    i18nKeyPrefix: 'learn.project.bc547',
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
    unitSlug: 'nmos-switch',
    moduleSlug: 'switching',
    exampleId: 'nmos',
    i18nKeyPrefix: 'learn.project.nmos',
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
    unitSlug: 'ne555-astable',
    moduleSlug: 'timing',
    exampleId: 'ne555',
    i18nKeyPrefix: 'learn.project.ne555',
    stepCount: 4
  },
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
  {
    unitSlug: 'buzzer-button',
    moduleSlug: 'actuators',
    exampleId: 'buzzer',
    i18nKeyPrefix: 'learn.project.buzzer',
    stepCount: 4
  },
  {
    unitSlug: 'arduino-dio-led',
    moduleSlug: 'mcu',
    exampleId: 'arduino',
    i18nKeyPrefix: 'learn.project.arduino',
    stepCount: 4
  },
  {
    unitSlug: 'i2c-oled-wiring',
    moduleSlug: 'buses',
    exampleId: 'i2cOled',
    i18nKeyPrefix: 'learn.project.i2cOled',
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

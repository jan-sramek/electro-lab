import type { ExamplePresetId } from '../../lab/services/lab-editor.store';

/** Theme hub on the Learn path (maps to `/learn/{moduleSlug}/…`). */
export interface LearnModuleDef {
  moduleSlug: string;
  /** i18n key for section heading on the hub, e.g. `learn.module.switching.title`. */
  titleKey: string;
  order: number;
}

/** One teachable project with a Lab preset deep-link. */
export interface LearnUnit {
  unitSlug: string;
  moduleSlug: string;
  exampleId: ExamplePresetId;
  /** Prefix for i18n keys: `{prefix}.title`, `.summary`, `.step1`, `.openLab`. */
  i18nKeyPrefix: string;
  stepCount: number;
}

export function learnUnitPath(unit: LearnUnit): string {
  return `/learn/${unit.moduleSlug}/${unit.unitSlug}`;
}

export function learnStepKey(unit: LearnUnit, step: number): string {
  return `${unit.i18nKeyPrefix}.step${step}`;
}

/** Stable `from` query value for Lab deep-links (`switching/bjt-switch`). */
export function learnFromSlug(unit: LearnUnit): string {
  return `${unit.moduleSlug}/${unit.unitSlug}`;
}

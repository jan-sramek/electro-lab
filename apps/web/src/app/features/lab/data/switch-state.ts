import { SchematicComponent, SchematicDocument } from './schematic.model';
import { simModelOf } from './symbol-library';

/** User-operable break-before-make paths (toggle switch or momentary button). */
export function isControllableSwitch(c: SchematicComponent): boolean {
  return c.modelKey === 'switch' || c.modelKey === 'pushbutton';
}

export function switchIsClosed(c: SchematicComponent): boolean {
  return c.params['closed'] === true;
}

/** True when the schematic has at least one user-operable switch or pushbutton. */
export function hasControllableSwitch(doc: SchematicDocument): boolean {
  return doc.components.some(isControllableSwitch);
}

/**
 * True when every controllable switch is open — capacitor discharge / LED fade path.
 * Returns false when there are no switches (cannot infer an open discharge path).
 */
export function allEnergyPathsOpen(doc: SchematicDocument): boolean {
  const switches = doc.components.filter(isControllableSwitch);
  if (!switches.length) return false;
  return switches.every((c) => !switchIsClosed(c));
}

/** True when every controllable switch is closed — RC charge / LED fade charge run. */
export function allEnergyPathsClosed(doc: SchematicDocument): boolean {
  const switches = doc.components.filter(isControllableSwitch);
  if (!switches.length) return false;
  return switches.every(switchIsClosed);
}

/** @deprecated Use {@link allEnergyPathsOpen}. */
export function allSwitchesOpen(doc: SchematicDocument): boolean {
  return allEnergyPathsOpen(doc);
}

/** Engine treats pushbutton as switch — include both for wire-current pin modeling. */
export function isSwitchLikeModel(modelKey: string): boolean {
  return simModelOf(modelKey) === 'switch';
}

/** Stable key for switch / pushbutton positions (playback + energy path changes). */
export function controllableSwitchStateKey(doc: SchematicDocument): string {
  return doc.components
    .filter(isControllableSwitch)
    .map((c) => `${c.id}:${switchIsClosed(c)}`)
    .sort()
    .join('|');
}

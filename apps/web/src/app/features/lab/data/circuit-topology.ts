import { SchematicComponent, SchematicDocument, assignNets } from './schematic.model';

/** Canonical key for a two-terminal storage element from its nets (stable across re-IDs). */
export function twoTerminalStorageKey(
  modelKey: 'capacitor' | 'inductor',
  na: string,
  nb: string
): string {
  const [n1, n2] = [na, nb].sort();
  return `${modelKey === 'capacitor' ? 'C' : 'L'}:${n1}|${n2}`;
}

export function capacitorStorageKey(c: SchematicComponent): string | null {
  if (c.modelKey !== 'capacitor') return null;
  const na = c.pins['a']?.net;
  const nb = c.pins['b']?.net;
  if (!na || !nb) return null;
  return twoTerminalStorageKey('capacitor', na, nb);
}

export function inductorStorageKey(c: SchematicComponent): string | null {
  if (c.modelKey !== 'inductor') return null;
  const na = c.pins['a']?.net;
  const nb = c.pins['b']?.net;
  if (!na || !nb) return null;
  return twoTerminalStorageKey('inductor', na, nb);
}

function wireNetPair(doc: SchematicDocument): string {
  return [...doc.wires]
    .map((w) => {
      const ca = doc.components.find((c) => c.id === w.a.componentId);
      const cb = doc.components.find((c) => c.id === w.b.componentId);
      const na = ca?.pins[w.a.pin]?.net ?? '';
      const nb = cb?.pins[w.b.pin]?.net ?? '';
      return [na, nb].sort().join('|');
    })
    .sort()
    .join(';');
}

/**
 * Fingerprint for stored C/L energy — net connectivity only, not component IDs.
 * Replacing C1 with C2 on the same nets keeps stored voltage.
 */
export function energyTopologyFingerprint(doc: SchematicDocument): string {
  const nettled = assignNets(doc);
  const storageKeys = nettled.components
    .flatMap((c) => {
      if (c.modelKey === 'capacitor') return capacitorStorageKey(c) ?? [];
      if (c.modelKey === 'inductor') return inductorStorageKey(c) ?? [];
      return [];
    })
    .sort()
    .join(';');
  return `${storageKeys}::${wireNetPair(nettled)}`;
}

/** @deprecated Use {@link energyTopologyFingerprint}. Kept for migration comparisons. */
export function schematicCapFingerprint(doc: SchematicDocument): string {
  return energyTopologyFingerprint(doc);
}

/** True when the schematic has capacitors in an RC network that needs transient analysis. */
export function hasRcEnergyNetwork(doc: SchematicDocument): boolean {
  const hasCap = doc.components.some((c) => c.modelKey === 'capacitor');
  if (!hasCap) return false;
  const hasR =
    doc.components.some((c) => c.modelKey === 'resistor') ||
    doc.components.some((c) => c.modelKey === 'led' || c.modelKey === 'diode');
  return hasR;
}

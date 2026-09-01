import { SchematicComponent, SchematicWire } from './schematic.model';
import { WireCurrentField, pinOutflowAmps, wireCurrentAtoB } from './wire-flow/wire-current-field';

export { pinOutflowAmps, wireCurrentAtoB };

/**
 * Conventional current leaving a schematic pin into attached wires (amperes),
 * given CircuitSim branch-current sign conventions.
 */

/** Largest |branch current| among real devices — used when a source current is missing. */
export function seriesCurrentHint(
  components: SchematicComponent[],
  currentOf: (id: string) => number | null
): number | null {
  let best = 0;
  for (const c of components) {
    if (c.modelKey === 'ground' || c.modelKey === 'junction' || c.modelKey === 'voltmeter') {
      continue;
    }
    const i = currentOf(c.id);
    if (typeof i === 'number' && Math.abs(i) > Math.abs(best)) best = i;
  }
  return Math.abs(best) > 1e-12 ? best : null;
}

/** Estimate I along every wire (A→B) via {@link WireCurrentField}. */
export function estimateAllWireCurrents(
  components: SchematicComponent[],
  wires: SchematicWire[],
  currentOf: (id: string) => number | null
): Map<string, number> {
  return new Map(new WireCurrentField(components, wires, currentOf).solve());
}

export function estimateWireCurrentAtoB(
  wire: SchematicWire,
  components: SchematicComponent[],
  wires: SchematicWire[],
  currentOf: (id: string) => number | null
): number {
  return estimateAllWireCurrents(components, wires, currentOf).get(wire.id) ?? 0;
}

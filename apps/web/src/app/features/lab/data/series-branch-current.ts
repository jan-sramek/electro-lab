import { SchematicDocument, SchematicWire, pinKey } from './schematic.model';

/** Teaching idle (~0.01 mA) — same floor as canvas / cap-branch display. */
export const SERIES_CURRENT_IDLE_A = 1e-5;

function wiresAt(wires: SchematicWire[], componentId: string, pin: string): SchematicWire[] {
  const k = pinKey({ componentId, pin });
  return wires.filter((w) => pinKey(w.a) === k || pinKey(w.b) === k);
}

function otherEnd(
  w: SchematicWire,
  componentId: string,
  pin: string
): { componentId: string; pin: string } {
  const k = pinKey({ componentId, pin });
  return pinKey(w.a) === k ? w.b : w.a;
}

function isSeriesPassThrough(modelKey: string): boolean {
  return (
    modelKey === 'resistor' ||
    modelKey === 'led' ||
    modelKey === 'diode' ||
    modelKey === 'ammeter' ||
    modelKey === 'ldr' ||
    modelKey === 'buzzer'
  );
}

/**
 * Series R↔LED (and similar) must show the same branch current on the canvas.
 * Piecewise LED cutoff can report 0 a sample earlier than the ohmic resistor; for teaching,
 * copy the larger |I| across a direct series neighbor so labels and wire-flow stay in lockstep.
 */
export function equalizeSeriesBranchCurrent(
  doc: SchematicDocument,
  componentId: string,
  reported: number | null,
  currentOf: (id: string) => number | null
): number | null {
  const c = doc.components.find((x) => x.id === componentId);
  if (!c || !isSeriesPassThrough(c.modelKey)) return reported;

  const pins =
    c.modelKey === 'led' || c.modelKey === 'diode' || c.modelKey === 'buzzer'
      ? (['a', 'c'] as const)
      : (['a', 'b'] as const);

  let best = reported;
  let bestMag = typeof reported === 'number' ? Math.abs(reported) : 0;

  for (const pin of pins) {
    const ws = wiresAt(doc.wires, c.id, pin);
    if (ws.length !== 1) continue;
    const other = otherEnd(ws[0]!, c.id, pin);
    const oc = doc.components.find((x) => x.id === other.componentId);
    if (!oc || !isSeriesPassThrough(oc.modelKey)) continue;

    // Neighbor must also be singly connected on that pin (true series, not a tee).
    if (wiresAt(doc.wires, oc.id, other.pin).length !== 1) continue;

    const oi = currentOf(oc.id);
    if (typeof oi !== 'number') continue;
    const mag = Math.abs(oi);
    if (mag > bestMag) {
      bestMag = mag;
      // Keep the sign of the component's own reported current when present; else neighbor sign.
      best =
        typeof reported === 'number' && Math.abs(reported) > SERIES_CURRENT_IDLE_A
          ? Math.sign(reported) * mag
          : oi;
    }
  }

  if (typeof best === 'number' && Math.abs(best) < SERIES_CURRENT_IDLE_A) return 0;
  return best;
}

import { SchematicComponent } from './schematic.model';
import { SYMBOL_LIBRARY } from './symbol-library';
import { symbolDisplayScale } from './symbol-scale';

export type TextAnchor = 'start' | 'middle' | 'end';

export interface PartLabelPlacement {
  /** Local (unrotated) offset from part origin. */
  x: number;
  y: number;
  textAnchor: TextAnchor;
}

type Side = 'n' | 's' | 'e' | 'w';

interface SideCandidate {
  side: Side;
  local: PartLabelPlacement;
  pinScore: number;
}

const CHAR_W = 2.9;
const LABEL_H = 5;
const PREFERENCE: Side[] = ['s', 'n', 'e', 'w'];

function localToWorld(
  c: SchematicComponent,
  lx: number,
  ly: number
): { x: number; y: number } {
  let x = lx;
  let y = ly;
  switch (c.rotation) {
    case 90:
      x = -ly;
      y = lx;
      break;
    case 180:
      x = -lx;
      y = -ly;
      break;
    case 270:
      x = ly;
      y = -lx;
      break;
  }
  return { x: c.x + x, y: c.y + y };
}

function pinExtent(c: SchematicComponent): Record<Side, number> {
  const extent: Record<Side, number> = { n: 0, s: 0, e: 0, w: 0 };
  for (const p of Object.values(c.pins)) {
    const ax = Math.abs(p.ox);
    const ay = Math.abs(p.oy);
    if (ax < 4 && ay < 4) continue;
    if (ax >= ay) {
      if (p.ox > 0) extent.e += 1;
      else extent.w += 1;
    } else {
      if (p.oy > 0) extent.s += 1;
      else extent.n += 1;
    }
  }
  return extent;
}

function sidePlacement(
  c: SchematicComponent,
  side: Side,
  hw: number,
  hh: number,
  gap: number
): PartLabelPlacement {
  switch (side) {
    case 'n':
      return { x: 0, y: -(hh + gap), textAnchor: 'middle' };
    case 'e':
      return { x: hw + gap, y: 1.5, textAnchor: 'start' };
    case 'w':
      return { x: -(hw + gap), y: 1.5, textAnchor: 'end' };
    case 's':
    default:
      return { x: 0, y: hh + gap, textAnchor: 'middle' };
  }
}

function labelBox(
  c: SchematicComponent,
  local: PartLabelPlacement,
  text: string
): { x0: number; y0: number; x1: number; y1: number } {
  const w = Math.max(text.length, 2) * CHAR_W;
  const world = localToWorld(c, local.x, local.y);
  let x0: number;
  let x1: number;
  if (local.textAnchor === 'start') {
    x0 = world.x;
    x1 = world.x + w;
  } else if (local.textAnchor === 'end') {
    x0 = world.x - w;
    x1 = world.x;
  } else {
    x0 = world.x - w / 2;
    x1 = world.x + w / 2;
  }
  return {
    x0,
    y0: world.y - LABEL_H / 2,
    x1,
    y1: world.y + LABEL_H / 2
  };
}

function overlaps(
  a: { x0: number; y0: number; x1: number; y1: number },
  b: { x0: number; y0: number; x1: number; y1: number },
  pad = 2
): boolean {
  return !(
    a.x1 + pad < b.x0 ||
    b.x1 + pad < a.x0 ||
    a.y1 + pad < b.y0 ||
    b.y1 + pad < a.y0
  );
}

function isSupply(modelKey: string): boolean {
  return modelKey === 'battery' || modelKey === 'pulse_source' || modelKey === 'ac_source';
}

function candidatesFor(c: SchematicComponent): SideCandidate[] {
  const def = SYMBOL_LIBRARY[c.modelKey];
  const s = symbolDisplayScale(c.modelKey);
  const hw = ((def?.width ?? 40) * s) / 2 + 2;
  const hh = ((def?.height ?? 40) * s) / 2 + 2;
  const gap = 3.2;
  const extent = pinExtent(c);

  // Supplies usually sit on the left rail — prefer outside (west) over pin-score.
  const preference = isSupply(c.modelKey)
    ? (['w', 's', 'n', 'e'] as Side[])
    : PREFERENCE;

  return preference.map((side) => ({
    side,
    local: sidePlacement(c, side, hw, hh, gap),
    // Supplies: preference order wins (pinScore 0). Others: avoid pin-heavy sides.
    pinScore: isSupply(c.modelKey) ? 0 : extent[side]
  }));
}

/**
 * Place a single part label on the least pin-crowded side (no neighbor awareness).
 */
export function placePartLabel(c: SchematicComponent): PartLabelPlacement {
  const ranked = [...candidatesFor(c)].sort((a, b) => {
    if (a.pinScore !== b.pinScore) return a.pinScore - b.pinScore;
    return 0; // keep preference order from candidatesFor
  });
  return ranked[0]!.local;
}

/**
 * Place id labels for all parts, avoiding pairwise overlaps when possible.
 */
export function placeAllPartLabels(
  components: SchematicComponent[]
): Map<string, PartLabelPlacement> {
  const out = new Map<string, PartLabelPlacement>();
  const boxes: { id: string; box: ReturnType<typeof labelBox> }[] = [];

  const labeled = components.filter((c) => c.modelKey !== 'junction');
  // Left-to-right then top-to-bottom so supply rails claim outer sides first.
  labeled.sort((a, b) => a.x - b.x || a.y - b.y);

  for (const c of labeled) {
    const ranked = [...candidatesFor(c)].sort((a, b) => {
      if (a.pinScore !== b.pinScore) return a.pinScore - b.pinScore;
      return 0;
    });
    let chosen: PartLabelPlacement | null = null;
    for (const cand of ranked) {
      const box = labelBox(c, cand.local, c.id);
      if (boxes.some((b) => overlaps(box, b.box))) continue;
      chosen = cand.local;
      boxes.push({ id: c.id, box });
      break;
    }
    if (!chosen) {
      chosen = ranked[0]!.local;
      boxes.push({ id: c.id, box: labelBox(c, chosen, c.id) });
    }
    out.set(c.id, chosen);
  }
  return out;
}

/** Measurement line sits just past the id label, same side. */
export function placePartMeasurement(
  c: SchematicComponent,
  idPlacement?: PartLabelPlacement
): PartLabelPlacement {
  const id = idPlacement ?? placePartLabel(c);
  const step = 5.5;
  if (id.y > 3) return { ...id, y: id.y + step };
  if (id.y < -3) return { ...id, y: id.y - step };
  if (id.x > 3) return { ...id, x: id.x + 1, y: id.y + step };
  if (id.x < -3) return { ...id, x: id.x - 1, y: id.y + step };
  return { ...id, y: id.y + step };
}

import {
  SchematicDocument,
  assignNets,
  compileNetlist
} from './schematic.model';
import { SimulateResponse } from '../api/circuit-api.types';

export type CompiledCircuit = ReturnType<typeof compileNetlist>;

/** Stable key for “same caps/wiring” — clear stored IC when this changes. */
export function schematicCapFingerprint(doc: SchematicDocument): string {
  const comps = [...doc.components]
    .map((c) => `${c.id}:${c.modelKey}`)
    .sort()
    .join('|');
  const wires = [...doc.wires]
    .map((w) => `${w.a.componentId}.${w.a.pin}-${w.b.componentId}.${w.b.pin}`)
    .sort()
    .join('|');
  return `${comps}::${wires}`;
}

/** True when every switch on the schematic is open (or there are no switches). */
export function allSwitchesOpen(doc: SchematicDocument): boolean {
  const switches = doc.components.filter((c) => c.modelKey === 'switch');
  if (!switches.length) return false;
  return switches.every((c) => !c.params['closed']);
}

/** Final V(a)−V(b) per capacitor from the last transient sample. */
export function finalCapVoltagesFromTran(
  doc: SchematicDocument,
  res: SimulateResponse
): Map<string, number> {
  const out = new Map<string, number>();
  const tran = res.tran;
  if (!tran?.time?.length) return out;
  const nettled = assignNets(doc);
  const last = tran.time.length - 1;
  const vOf = (net: string): number | null => {
    if (net === nettled.groundNet) return 0;
    const s = tran.nodeVoltages.find((x) => x.id === net);
    const v = s?.values[last];
    return typeof v === 'number' ? v : null;
  };
  for (const c of nettled.components) {
    if (c.modelKey !== 'capacitor') continue;
    const na = c.pins['a']?.net;
    const nb = c.pins['b']?.net;
    if (!na || !nb) continue;
    const va = vOf(na);
    const vb = vOf(nb);
    if (va === null || vb === null) continue;
    out.set(c.id, va - vb);
  }
  return out;
}

/** Inject stored IC into capacitor params when discharging (switches open). */
export function compileNetlistWithCapIc(
  doc: SchematicDocument,
  stored: Map<string, number> | null,
  inject: boolean
): CompiledCircuit {
  const circuit = compileNetlist(doc);
  if (!inject || !stored?.size) return circuit;
  return {
    ...circuit,
    elements: circuit.elements.map((el) => {
      if (el.model !== 'capacitor') return el;
      const ic = stored.get(el.id);
      if (ic === undefined) return el;
      return { ...el, params: { ...el.params, ic } };
    })
  };
}

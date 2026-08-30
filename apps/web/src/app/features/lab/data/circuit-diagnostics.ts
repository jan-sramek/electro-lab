import { AnalysisMode, SchematicDocument, assignNets } from './schematic.model';
import { SYMBOL_LIBRARY } from './symbol-library';

export type DiagnosticCode =
  | 'empty_circuit'
  | 'no_ground'
  | 'ground_disconnected'
  | 'floating_component'
  | 'dc_capacitor_island'
  | 'shorted_voltage_source'
  | 'ac_nonlinear_open'
  | 'ac_source_tran_no_freq'
  | 'switch_inductor_spike';

export interface CircuitDiagnostic {
  code: DiagnosticCode;
  severity: 'error' | 'warning';
  /** i18n key, e.g. diag.no_ground */
  messageKey: string;
  componentIds: string[];
  netIds: string[];
}

export function diagnosticMessageKey(code: DiagnosticCode): string {
  return `diag.${code}`;
}

export const SINGULAR_FALLBACK_KEY = 'diag.singular_fallback';

export function isSingularMatrixMessage(message: string): boolean {
  return /singular circuit matrix/i.test(message);
}

function isSimElement(modelKey: string): boolean {
  const def = SYMBOL_LIBRARY[modelKey];
  return !!def && !def.schematicOnly;
}

function diag(
  code: DiagnosticCode,
  severity: 'error' | 'warning',
  componentIds: string[] = [],
  netIds: string[] = []
): CircuitDiagnostic {
  return {
    code,
    severity,
    messageKey: diagnosticMessageKey(code),
    componentIds,
    netIds
  };
}

/** Diagnose schematic before / alongside simulation. Errors should block the API call. */
export function diagnoseSchematic(
  doc: SchematicDocument,
  mode: AnalysisMode
): CircuitDiagnostic[] {
  const out: CircuitDiagnostic[] = [];
  const simParts = doc.components.filter((c) => isSimElement(c.modelKey));
  const grounds = doc.components.filter((c) => c.modelKey === 'ground');

  if (simParts.length === 0) {
    out.push(diag('empty_circuit', 'error'));
    return out;
  }

  if (grounds.length === 0) {
    out.push(diag('no_ground', 'error', simParts.map((c) => c.id)));
    return out;
  }

  const wiredIds = new Set<string>();
  for (const w of doc.wires) {
    wiredIds.add(w.a.componentId);
    wiredIds.add(w.b.componentId);
  }

  if (!grounds.some((g) => wiredIds.has(g.id))) {
    out.push(diag('ground_disconnected', 'error', grounds.map((g) => g.id)));
  }

  const floating = simParts.filter((c) => !wiredIds.has(c.id));
  if (floating.length > 0) {
    out.push(diag('floating_component', 'error', floating.map((c) => c.id)));
  }

  const nettled = assignNets(doc);
  const shortedVs = nettled.components.filter((c) => {
    if (
      c.modelKey !== 'battery' &&
      c.modelKey !== 'pulse_source' &&
      c.modelKey !== 'ac_source'
    ) {
      return false;
    }
    const p = c.pins['p']?.net;
    const n = c.pins['n']?.net;
    return !!p && !!n && p === n;
  });
  if (shortedVs.length > 0) {
    out.push(diag('shorted_voltage_source', 'error', shortedVs.map((c) => c.id)));
  }

  if (mode === 'dcOp') {
    const netModels = new Map<string, { models: string[]; ids: string[] }>();
    for (const c of nettled.components) {
      if (!isSimElement(c.modelKey)) continue;
      for (const pin of Object.values(c.pins)) {
        const entry = netModels.get(pin.net) ?? { models: [], ids: [] };
        entry.models.push(c.modelKey);
        entry.ids.push(c.id);
        netModels.set(pin.net, entry);
      }
    }

    const islandNets: string[] = [];
    const islandCaps: string[] = [];
    for (const [net, entry] of netModels) {
      if (net === nettled.groundNet) continue;
      if (entry.models.length > 0 && entry.models.every((m) => m === 'capacitor')) {
        islandNets.push(net);
        for (const id of entry.ids) {
          if (!islandCaps.includes(id)) islandCaps.push(id);
        }
      }
    }

    if (islandNets.length > 0) {
      out.push(diag('dc_capacitor_island', 'warning', islandCaps, islandNets));
    }
  }

  if (mode === 'ac') {
    const nonlinear = simParts.filter(
      (c) => c.modelKey === 'led' || c.modelKey === 'diode' || c.modelKey === 'bjt_npn'
    );
    if (nonlinear.length > 0) {
      out.push(diag('ac_nonlinear_open', 'warning', nonlinear.map((c) => c.id)));
    }
  }

  if (mode === 'tran') {
    const silentAc = simParts.filter(
      (c) =>
        c.modelKey === 'ac_source' &&
        !(typeof c.params['freq'] === 'number' && (c.params['freq'] as number) > 0)
    );
    if (silentAc.length > 0) {
      out.push(diag('ac_source_tran_no_freq', 'warning', silentAc.map((c) => c.id)));
    }

    const switches = simParts.filter((c) => c.modelKey === 'switch');
    const inductors = simParts.filter((c) => c.modelKey === 'inductor');
    if (switches.length > 0 && inductors.length > 0) {
      out.push(
        diag('switch_inductor_spike', 'warning', [
          ...switches.map((c) => c.id),
          ...inductors.map((c) => c.id)
        ])
      );
    }
  }

  return out;
}

export function diagnosticErrors(diags: CircuitDiagnostic[]): CircuitDiagnostic[] {
  return diags.filter((d) => d.severity === 'error');
}

export function diagnosticWarnings(diags: CircuitDiagnostic[]): CircuitDiagnostic[] {
  return diags.filter((d) => d.severity === 'warning');
}

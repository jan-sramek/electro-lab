import { AnalysisMode, SchematicDocument, assignNets } from './schematic.model';
import { SYMBOL_LIBRARY } from './symbol-library';

export type DiagnosticCode =
  | 'empty_circuit'
  | 'no_ground'
  | 'ground_disconnected'
  | 'floating_component'
  | 'dc_capacitor_island';

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

  if (mode === 'dcOp') {
    const nettled = assignNets(doc);
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

  return out;
}

export function diagnosticErrors(diags: CircuitDiagnostic[]): CircuitDiagnostic[] {
  return diags.filter((d) => d.severity === 'error');
}

export function diagnosticWarnings(diags: CircuitDiagnostic[]): CircuitDiagnostic[] {
  return diags.filter((d) => d.severity === 'warning');
}

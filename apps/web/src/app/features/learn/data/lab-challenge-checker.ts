import { SchematicDocument } from '../../lab/data/schematic.model';
import { diagnoseSchematic } from '../../lab/data/circuit-diagnostics';
import { SimulateResponse } from '../../lab/api/circuit-api.types';
import { simModelOf } from '../../lab/data/symbol-library';
import { extractEnergyState } from '../../lab/data/tran-continuation';
import { LearnLabCriterionDto } from '../api/learning-api.types';

export interface LabChallengeContext {
  doc: SchematicDocument;
  result: SimulateResponse | null;
  analysisMode: string;
}

export interface CriterionCheckResult {
  criterionId: number;
  passed: boolean;
}

export function checkLabCriteria(
  criteria: LearnLabCriterionDto[],
  ctx: LabChallengeContext
): CriterionCheckResult[] {
  return criteria.map((c) => ({
    criterionId: c.id,
    passed: checkCriterion(c, ctx)
  }));
}

export function allCriteriaPassed(results: CriterionCheckResult[]): boolean {
  return results.length > 0 && results.every((r) => r.passed);
}

/** Match palette part ids (bc547) and sim/engine keys (bjt_npn), including pushbutton↔switch. */
export function modelKeyMatches(componentKey: string, required: string): boolean {
  if (componentKey === required) return true;
  const simC = simModelOf(componentKey);
  const simR = simModelOf(required);
  return simC === required || componentKey === simR || simC === simR;
}

function componentsByModel(doc: SchematicDocument, modelKey: string): string[] {
  return doc.components.filter((c) => modelKeyMatches(c.modelKey, modelKey)).map((c) => c.id);
}

function docHasModel(doc: SchematicDocument, required: string): boolean {
  return doc.components.some((c) => modelKeyMatches(c.modelKey, required));
}

function pinNetVoltage(
  doc: SchematicDocument,
  result: SimulateResponse | null,
  componentId: string,
  pin: string
): number | undefined {
  const nodes = result?.dcOp?.nodeVoltages;
  if (!nodes) return undefined;
  const comp = doc.components.find((c) => c.id === componentId);
  const net = comp?.pins[pin]?.net;
  if (!net || net === doc.groundNet) return undefined;
  return nodes[net];
}

function pinNetAcMag(
  doc: SchematicDocument,
  result: SimulateResponse | null,
  componentId: string,
  pin: string
): number | undefined {
  const point = result?.ac?.points?.[0];
  if (!point) return undefined;
  const comp = doc.components.find((c) => c.id === componentId);
  const net = comp?.pins[pin]?.net;
  if (!net || net === doc.groundNet) return undefined;
  return point.nodeVoltages[net]?.mag;
}

/** Peak (max) sample on a pin's net over the transient — for rectifiers / pulsed loads. */
function pinNetTranPeak(
  doc: SchematicDocument,
  result: SimulateResponse | null,
  componentId: string,
  pin: string
): number | undefined {
  const series = result?.tran?.nodeVoltages;
  if (!series?.length) return undefined;
  const comp = doc.components.find((c) => c.id === componentId);
  const net = comp?.pins[pin]?.net;
  if (!net || net === doc.groundNet) return undefined;
  const row = series.find((s) => s.id === net);
  if (!row?.values.length) return undefined;
  return Math.max(...row.values);
}

function pinNetTranPeakToPeak(
  doc: SchematicDocument,
  result: SimulateResponse | null,
  componentId: string,
  pin: string
): number | undefined {
  const series = result?.tran?.nodeVoltages;
  if (!series?.length) return undefined;
  const comp = doc.components.find((c) => c.id === componentId);
  const net = comp?.pins[pin]?.net;
  if (!net || net === doc.groundNet) return undefined;
  const row = series.find((s) => s.id === net);
  if (!row?.values.length) return undefined;
  const max = Math.max(...row.values);
  const min = Math.min(...row.values);
  return max - min;
}

function modelTranCurrentPeakAbs(
  result: SimulateResponse | null,
  componentId: string
): number | undefined {
  const series = result?.tran?.branchCurrents?.find((s) => s.id === componentId);
  if (!series?.values.length) return undefined;
  return series.values.reduce((best, v) => (Math.abs(v) > Math.abs(best) ? Math.abs(v) : best), 0);
}

function branchCurrent(result: SimulateResponse | null, refId: string): number | undefined {
  return result?.dcOp?.branchCurrents?.[refId];
}

function checkCriterion(criterion: LearnLabCriterionDto, ctx: LabChallengeContext): boolean {
  const params = parseParams(criterion.paramsJson);
  switch (criterion.type) {
    case 'sim_ok':
      return ctx.result?.ok === true;
    case 'no_circuit_errors':
      return diagnoseSchematic(ctx.doc, ctx.analysisMode as 'dcOp' | 'tran' | 'ac').length === 0;
    case 'analysis_mode':
      return ctx.analysisMode === String(params['mode'] ?? '');
    case 'has_models': {
      const models = Array.isArray(params['models']) ? (params['models'] as string[]) : [];
      return models.every((m) => docHasModel(ctx.doc, m));
    }
    case 'min_wire_count': {
      const min = Number(params['min'] ?? 1);
      return ctx.doc.wires.length >= min;
    }
    case 'any_model_current_min': {
      const modelKey = String(params['modelKey'] ?? '');
      const minAmps = Number(params['minAmps'] ?? 0);
      return componentsByModel(ctx.doc, modelKey).some((id) => {
        const amps = branchCurrent(ctx.result, id);
        return amps !== undefined && amps >= minAmps;
      });
    }
    case 'any_model_current_max': {
      const modelKey = String(params['modelKey'] ?? '');
      const maxAmps = Number(params['maxAmps'] ?? 0);
      return componentsByModel(ctx.doc, modelKey).every((id) => {
        const amps = branchCurrent(ctx.result, id);
        return amps === undefined || Math.abs(amps) <= maxAmps;
      });
    }
    case 'any_cap_voltage_final_min': {
      const modelKey = String(params['modelKey'] ?? 'capacitor');
      const minVolts = Number(params['minVolts'] ?? 0);
      const caps = componentsByModel(ctx.doc, modelKey);
      if (!caps.length || !ctx.result?.tran) return false;
      // Engine series are net ids — Vc is Va−Vb at the last transient sample.
      const energy = extractEnergyState(ctx.doc, ctx.result);
      return caps.some((id) => {
        const v = energy.caps.get(id);
        return v !== undefined && Math.abs(v) >= minVolts;
      });
    }
    case 'any_switch_closed':
      return ctx.doc.components.some(
        (c) => modelKeyMatches(c.modelKey, 'switch') && c.params?.['closed'] === true
      );
    case 'any_pushbutton_pressed':
      return ctx.doc.components.some(
        (c) => c.modelKey === 'pushbutton' && c.params?.['closed'] === true
      );
    case 'any_pin_dc_voltage_between': {
      const modelKey = String(params['modelKey'] ?? '');
      const pin = String(params['pin'] ?? '');
      const minVolts = Number(params['minVolts'] ?? Number.NEGATIVE_INFINITY);
      const maxVolts = Number(params['maxVolts'] ?? Number.POSITIVE_INFINITY);
      return componentsByModel(ctx.doc, modelKey).some((id) => {
        const v = pinNetVoltage(ctx.doc, ctx.result, id, pin);
        return v !== undefined && v >= minVolts && v <= maxVolts;
      });
    }
    case 'any_pin_ac_mag_between': {
      const modelKey = String(params['modelKey'] ?? '');
      const pin = String(params['pin'] ?? '');
      const minMag = Number(params['minMag'] ?? 0);
      const maxMag = Number(params['maxMag'] ?? Number.POSITIVE_INFINITY);
      return componentsByModel(ctx.doc, modelKey).some((id) => {
        const mag = pinNetAcMag(ctx.doc, ctx.result, id, pin);
        return mag !== undefined && mag >= minMag && mag <= maxMag;
      });
    }
    case 'any_pin_tran_peak_min': {
      const modelKey = String(params['modelKey'] ?? '');
      const pin = String(params['pin'] ?? '');
      const minVolts = Number(params['minVolts'] ?? 0);
      return componentsByModel(ctx.doc, modelKey).some((id) => {
        const peak = pinNetTranPeak(ctx.doc, ctx.result, id, pin);
        return peak !== undefined && peak >= minVolts;
      });
    }
    case 'any_pin_tran_peak_to_peak_min': {
      const modelKey = String(params['modelKey'] ?? '');
      const pin = String(params['pin'] ?? '');
      const minVolts = Number(params['minVolts'] ?? 0);
      return componentsByModel(ctx.doc, modelKey).some((id) => {
        const p2p = pinNetTranPeakToPeak(ctx.doc, ctx.result, id, pin);
        return p2p !== undefined && p2p >= minVolts;
      });
    }
    case 'any_model_min_count': {
      const modelKey = String(params['modelKey'] ?? '');
      const min = Number(params['min'] ?? 1);
      return componentsByModel(ctx.doc, modelKey).length >= min;
    }
    case 'any_model_tran_current_peak_min': {
      const modelKey = String(params['modelKey'] ?? '');
      const minAmps = Number(params['minAmps'] ?? 0);
      return componentsByModel(ctx.doc, modelKey).some((id) => {
        const peak = modelTranCurrentPeakAbs(ctx.result, id);
        return peak !== undefined && peak >= minAmps;
      });
    }
    case 'any_part_not_burned': {
      const modelKey = String(params['modelKey'] ?? '');
      const parts = componentsByModel(ctx.doc, modelKey);
      if (!parts.length) return false;
      return parts.every((id) => {
        const c = ctx.doc.components.find((x) => x.id === id);
        return c?.params?.['burned'] !== true;
      });
    }
    case 'branch_current_min': {
      const refId = String(params['refId'] ?? '');
      const minAmps = Number(params['minAmps'] ?? 0);
      const amps = branchCurrent(ctx.result, refId);
      return amps !== undefined && amps >= minAmps;
    }
    case 'branch_current_max': {
      const refId = String(params['refId'] ?? '');
      const maxAmps = Number(params['maxAmps'] ?? 0);
      const amps = branchCurrent(ctx.result, refId);
      return amps !== undefined && amps <= maxAmps;
    }
    case 'switch_state': {
      const refId = String(params['refId'] ?? '');
      const closed = Boolean(params['closed']);
      const comp = ctx.doc.components.find((c) => c.id === refId);
      if (!comp) return false;
      return (comp.params?.['closed'] === true) === closed;
    }
    default:
      return false;
  }
}

function parseParams(json: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(json);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

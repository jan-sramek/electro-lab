import { SchematicDocument } from '../../lab/data/schematic.model';
import { diagnoseSchematic } from '../../lab/data/circuit-diagnostics';
import { SimulateResponse } from '../../lab/api/circuit-api.types';
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

function componentsByModel(doc: SchematicDocument, modelKey: string): string[] {
  return doc.components.filter((c) => c.modelKey === modelKey).map((c) => c.id);
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
      return models.every((m) => ctx.doc.components.some((c) => c.modelKey === m));
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
      for (const id of caps) {
        const series = ctx.result.tran.nodeVoltages.find((s) => s.id === id);
        const values = series?.values;
        if (!values?.length) continue;
        const v = values[values.length - 1];
        if (v >= minVolts) return true;
      }
      return false;
    }
    case 'any_switch_closed':
      return ctx.doc.components.some(
        (c) => c.modelKey === 'switch' && c.params?.['closed'] === true
      );
    case 'any_pushbutton_pressed':
      return ctx.doc.components.some(
        (c) => c.modelKey === 'pushbutton' && c.params?.['closed'] === true
      );
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

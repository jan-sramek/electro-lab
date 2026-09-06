import { I18nService } from '../../../core/i18n/i18n.service';
import { LearnLabCriterionDto } from '../api/learning-api.types';

/**
 * Human-readable checklist line for a lab criterion, with its actual parameters
 * ("LED current at least 8 mA") instead of the generic per-type label. Falls back
 * to the seeded label when a type has no detail template.
 */
export function criterionText(c: LearnLabCriterionDto, i18n: I18nService): string {
  let params: Record<string, unknown> = {};
  try {
    params = JSON.parse(c.paramsJson || '{}') as Record<string, unknown>;
  } catch {
    params = {};
  }
  const key = `learn.challenge.detail.${c.type}`;
  if (!i18n.has(key)) return i18n.t(c.labelKey);

  const part = (modelKey: unknown): string => {
    const k = String(modelKey ?? '');
    const labelKey = `lab.symbol.${k}`;
    return i18n.has(labelKey) ? i18n.t(labelKey) : k;
  };
  const vars: Record<string, string | number> = {
    part: part(params['modelKey']),
    parts: Array.isArray(params['models']) ? (params['models'] as unknown[]).map(part).join(', ') : '',
    ref: String(params['refId'] ?? ''),
    pin: String(params['pin'] ?? ''),
    mode: modeName(String(params['mode'] ?? ''), i18n),
    min: Number(params['min'] ?? 0),
    minA: formatAmps(params['minAmps']),
    maxA: formatAmps(params['maxAmps']),
    minV: formatVolts(params['minVolts']),
    maxV: formatVolts(params['maxVolts']),
    minMag: formatVolts(params['minMag']),
    maxMag: formatVolts(params['maxMag']),
    state: i18n.t(params['closed'] === false ? 'learn.challenge.detail.state.open' : 'learn.challenge.detail.state.closed')
  };
  return i18n.t(key, vars);
}

function modeName(mode: string, i18n: I18nService): string {
  const key = `learn.challenge.detail.mode.${mode}`;
  return i18n.has(key) ? i18n.t(key) : mode;
}

export function formatAmps(v: unknown): string {
  const a = Number(v);
  if (!Number.isFinite(a)) return '';
  const mA = a * 1000;
  if (Math.abs(mA) >= 1) return `${trim(mA)} mA`;
  return `${trim(mA * 1000)} µA`;
}

export function formatVolts(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return '';
  return `${trim(n)} V`;
}

function trim(n: number): string {
  const s = Math.abs(n) >= 100 ? n.toFixed(0) : Math.abs(n) >= 10 ? n.toFixed(1) : n.toFixed(2);
  return s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

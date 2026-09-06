import { LearnUnitProgressDto } from '../api/learning-api.types';
import { LEARN_UNITS } from './learn-catalog';
import { LearnUnit, unitHasLab } from './learn-catalog.model';

/**
 * Points per unit. Reading and the quiz complete a unit; the optional lab challenge
 * is the big bonus, so builders end up well ahead of readers. Points are derived from
 * progress flags — nothing extra is stored.
 */
export const LEARN_POINTS = Object.freeze({ read: 10, quiz: 30, lab: 60 });

export function unitPointsMax(hasLab: boolean): number {
  return LEARN_POINTS.read + LEARN_POINTS.quiz + (hasLab ? LEARN_POINTS.lab : 0);
}

export function unitPointsEarned(progress: LearnUnitProgressDto | null | undefined, hasLab: boolean): number {
  if (!progress) return 0;
  let pts = 0;
  if (progress.readComplete) pts += LEARN_POINTS.read;
  if (progress.quizPassed) pts += LEARN_POINTS.quiz;
  if (hasLab && progress.labPassed) pts += LEARN_POINTS.lab;
  return pts;
}

export interface LearnPointsTotal {
  earned: number;
  max: number;
}

export function totalPoints(
  progressByKey: Record<string, LearnUnitProgressDto>,
  units: readonly LearnUnit[] = LEARN_UNITS
): LearnPointsTotal {
  let earned = 0;
  let max = 0;
  for (const u of units) {
    const hasLab = unitHasLab(u);
    max += unitPointsMax(hasLab);
    earned += unitPointsEarned(progressByKey[`${u.moduleSlug}/${u.unitSlug}`], hasLab);
  }
  return { earned, max };
}

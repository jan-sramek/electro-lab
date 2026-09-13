import { LearnUnitProgressDto } from '../api/learning-api.types';
import { LEARN_UNITS } from './learn-catalog';
import { finalQuizQuestionCount } from './learn-final-quizzes';
import { LearnUnit, unitHasLab, unitIsOptional } from './learn-catalog.model';

/**
 * Points per unit. Reading is fixed; quiz points scale with correct answers
 * (full quiz bank awards the quiz/finalQuiz totals below). The optional lab
 * challenge is the big bonus. Counts come from progress when present.
 */
export const LEARN_POINTS = Object.freeze({ read: 10, quiz: 30, lab: 60, finalQuiz: 60 });

/** Standard formative quizzes have five questions; finals use their own length. */
export const STANDARD_QUIZ_QUESTION_COUNT = 5;

export function quizQuestionCountFor(unitSlug: string | null | undefined, fallback = STANDARD_QUIZ_QUESTION_COUNT): number {
  return (unitSlug ? finalQuizQuestionCount(unitSlug) : null) ?? fallback;
}

/**
 * Max quiz points for a unit. Group finals and longer formative banks
 * (e.g. circuit-elements) use the higher finalQuiz total.
 */
export function quizMaxPointsFor(unitSlug?: string | null, finalQuiz = false): number {
  if (finalQuiz) return LEARN_POINTS.finalQuiz;
  const longCount = unitSlug ? finalQuizQuestionCount(unitSlug) : null;
  if (longCount != null && longCount > STANDARD_QUIZ_QUESTION_COUNT) return LEARN_POINTS.finalQuiz;
  return LEARN_POINTS.quiz;
}

/** Points for a quiz attempt: proportional to correct / total, rounded. */
export function quizPointsForCorrect(
  correct: number,
  total: number,
  finalQuiz = false,
  unitSlug?: string | null
): number {
  if (total <= 0 || correct <= 0) return 0;
  const max = quizMaxPointsFor(unitSlug, finalQuiz);
  return Math.round((Math.min(correct, total) / total) * max);
}

export function unitPointsMax(hasLab: boolean, finalQuiz = false, unitSlug?: string | null): number {
  return LEARN_POINTS.read + quizMaxPointsFor(unitSlug, finalQuiz) + (hasLab ? LEARN_POINTS.lab : 0);
}

export function unitPointsEarned(
  progress: LearnUnitProgressDto | null | undefined,
  hasLab: boolean,
  finalQuiz = false,
  questionCount?: number
): number {
  if (!progress) return 0;
  let pts = 0;
  if (progress.readComplete) pts += LEARN_POINTS.read;
  const total = progress.quizTotalCount || questionCount || quizQuestionCountFor(progress.unitSlug);
  const correct = progress.quizCorrectCount;
  if (correct != null && correct > 0 && total > 0) {
    pts += quizPointsForCorrect(correct, total, finalQuiz, progress.unitSlug);
  } else if (progress.quizPassed) {
    // Legacy rows that passed before per-question scoring: full quiz points.
    pts += quizMaxPointsFor(progress.unitSlug, finalQuiz);
  }
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
    // Optional (difficult) units are pure bonus: they count toward earned, not toward the max.
    if (!unitIsOptional(u)) max += unitPointsMax(hasLab, !!u.finalQuiz, u.unitSlug);
    earned += unitPointsEarned(
      progressByKey[`${u.moduleSlug}/${u.unitSlug}`],
      hasLab,
      !!u.finalQuiz,
      quizQuestionCountFor(u.unitSlug)
    );
  }
  return { earned, max };
}

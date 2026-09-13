import {
  LearnUnitDetailResponse,
  QuizQuestionResultDto,
  QuizSubmitResponse
} from '../api/learning-api.types';
import { LEARN_QUIZ_KEYS } from './learn-final-quizzes';

/**
 * Offline answer key. Standard units use the seeder's StandardQuiz shape
 * (services/learning-api/Seed/LearnCatalogSeeder.cs): q1 → a, q2 → b, q3 → c,
 * keyed by question order (API question ids are database ids, not positions).
 * Longer quizzes (group finals) carry their own key in learn-final-quizzes.ts.
 */
export const STANDARD_QUIZ_CORRECT_BY_ORDER: readonly string[] = ['a', 'b', 'c'];

export function correctOptionForOrder(order: number, unitSlug?: string | null): string | undefined {
  const key = (unitSlug && LEARN_QUIZ_KEYS[unitSlug]) || STANDARD_QUIZ_CORRECT_BY_ORDER;
  return key[order - 1];
}

/** Mirrors LearnQuizRules.PassCountFor: short quizzes must be perfect, long ones pass at 80 %. */
export function quizPassCountFor(questionCount: number): number {
  return questionCount <= 3 ? questionCount : Math.ceil(questionCount * 0.8);
}

/** Grade locally with the same rule as the server. */
export function gradeQuizLocally(
  unit: Pick<LearnUnitDetailResponse, 'i18nKeyPrefix' | 'quiz'> & { unitSlug?: string },
  answers: Record<number, string>
): QuizSubmitResponse {
  const questions = [...unit.quiz.questions].sort((a, b) => a.order - b.order);
  const results: QuizQuestionResultDto[] = [];
  let correctCount = 0;
  questions.forEach((q, idx) => {
    const order = q.order || idx + 1;
    const correctOptionId = correctOptionForOrder(order, unit.unitSlug) ?? '';
    const correct = correctOptionId !== '' && answers[q.id] === correctOptionId;
    if (correct) correctCount++;
    results.push({
      questionId: q.id,
      correct,
      correctOptionId,
      explanationKey: `${unit.i18nKeyPrefix}.quiz.q${order}.explain`
    });
  });
  const passCount = unit.quiz.passCount || quizPassCountFor(questions.length);
  return {
    passed: questions.length > 0 && correctCount >= passCount,
    correctCount,
    totalCount: questions.length,
    results
  };
}

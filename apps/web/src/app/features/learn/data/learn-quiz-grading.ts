import {
  LearnUnitDetailResponse,
  QuizQuestionResultDto,
  QuizSubmitResponse
} from '../api/learning-api.types';

/**
 * Offline answer key. Every unit uses the seeder's StandardQuiz shape
 * (services/learning-api/Seed/LearnCatalogSeeder.cs): q1 → a, q2 → b, q3 → c,
 * keyed by question order (API question ids are database ids, not positions).
 */
export const STANDARD_QUIZ_CORRECT_BY_ORDER: readonly string[] = ['a', 'b', 'c'];

export function correctOptionForOrder(order: number): string | undefined {
  return STANDARD_QUIZ_CORRECT_BY_ORDER[order - 1];
}

/** Grade locally with the same rule as the server: pass only when every answer is correct. */
export function gradeQuizLocally(
  unit: Pick<LearnUnitDetailResponse, 'i18nKeyPrefix' | 'quiz'>,
  answers: Record<number, string>
): QuizSubmitResponse {
  const questions = [...unit.quiz.questions].sort((a, b) => a.order - b.order);
  const results: QuizQuestionResultDto[] = [];
  let correctCount = 0;
  questions.forEach((q, idx) => {
    const order = q.order || idx + 1;
    const correctOptionId = correctOptionForOrder(order) ?? '';
    const correct = correctOptionId !== '' && answers[q.id] === correctOptionId;
    if (correct) correctCount++;
    results.push({
      questionId: q.id,
      correct,
      correctOptionId,
      explanationKey: `${unit.i18nKeyPrefix}.quiz.q${order}.explain`
    });
  });
  return {
    passed: questions.length > 0 && correctCount === questions.length,
    correctCount,
    totalCount: questions.length,
    results
  };
}

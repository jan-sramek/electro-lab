export type UnitAvailability = 'locked' | 'available' | 'inProgress' | 'complete';

export interface LearnCatalogResponse {
  modules: LearnModuleDto[];
}

export interface LearnModuleDto {
  slug: string;
  titleKey: string;
  order: number;
  units: LearnUnitSummaryDto[];
}

export interface LearnUnitSummaryDto {
  moduleSlug: string;
  unitSlug: string;
  exampleId: string;
  i18nKeyPrefix: string;
  order: number;
  nextModuleSlug: string | null;
  nextUnitSlug: string | null;
  availability: UnitAvailability;
}

export interface LearnUnitDetailResponse {
  moduleSlug: string;
  unitSlug: string;
  exampleId: string;
  i18nKeyPrefix: string;
  order: number;
  nextModuleSlug: string | null;
  nextUnitSlug: string | null;
  availability: UnitAvailability;
  lessonBlocks: LearnLessonBlockDto[];
  quiz: LearnQuizDto;
  labChallenge: LearnLabChallengeDto;
  progress: LearnUnitProgressDto;
}

export interface LearnLessonBlockDto {
  id: number;
  order: number;
  titleKey: string | null;
  bodyKey: string;
}

export interface LearnQuizDto {
  passCount: number;
  questions: LearnQuizQuestionDto[];
}

export interface LearnQuizQuestionDto {
  id: number;
  order: number;
  promptKey: string;
  options: LearnQuizOptionDto[];
}

export interface LearnQuizOptionDto {
  id: string;
  labelKey: string;
}

export interface LearnLabChallengeDto {
  criteria: LearnLabCriterionDto[];
}

export interface LearnLabCriterionDto {
  id: number;
  order: number;
  labelKey: string;
  type: string;
  paramsJson: string;
}

export interface LearnProgressSnapshotResponse {
  sessionId: string;
  units: LearnUnitProgressDto[];
}

export interface LearnUnitProgressDto {
  moduleSlug: string;
  unitSlug: string;
  readComplete: boolean;
  quizPassed: boolean;
  labPassed: boolean;
  complete: boolean;
}

export interface QuizSubmitRequest {
  answers: Record<number, string>;
}

export interface QuizSubmitResponse {
  passed: boolean;
  correctCount: number;
  totalCount: number;
  results: QuizQuestionResultDto[];
}

export interface QuizQuestionResultDto {
  questionId: number;
  correct: boolean;
  correctOptionId: string;
  explanationKey: string;
}

export interface LabVerifyRequest {
  results: LabCriterionResultDto[];
}

export interface LabCriterionResultDto {
  criterionId: number;
  passed: boolean;
}

export interface LabVerifyResponse {
  passed: boolean;
  progress: LearnUnitProgressDto;
}

export type LearnUnitPhase = 'read' | 'quiz' | 'lab' | 'complete';

export function resolveUnitPhase(
  progress: LearnUnitProgressDto,
  availability: UnitAvailability
): LearnUnitPhase {
  if (availability === 'locked') return 'read';
  if (progress.complete) return 'complete';
  if (progress.labPassed) return 'complete';
  if (progress.quizPassed) return 'lab';
  if (progress.readComplete) return 'quiz';
  return 'read';
}

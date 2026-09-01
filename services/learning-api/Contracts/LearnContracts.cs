namespace ElectroLab.LearningApi.Contracts;

public sealed record LearnCatalogResponse(IReadOnlyList<LearnModuleDto> Modules);

public sealed record LearnModuleDto(
    string Slug,
    string TitleKey,
    int Order,
    IReadOnlyList<LearnUnitSummaryDto> Units);

public sealed record LearnUnitSummaryDto(
    string ModuleSlug,
    string UnitSlug,
    string ExampleId,
    string I18nKeyPrefix,
    int Order,
    string? NextModuleSlug,
    string? NextUnitSlug,
    UnitAvailability Availability);

public enum UnitAvailability
{
    Locked,
    Available,
    InProgress,
    Complete
}

public sealed record LearnUnitDetailResponse(
    string ModuleSlug,
    string UnitSlug,
    string ExampleId,
    string I18nKeyPrefix,
    int Order,
    string? NextModuleSlug,
    string? NextUnitSlug,
    UnitAvailability Availability,
    IReadOnlyList<LearnLessonBlockDto> LessonBlocks,
    LearnQuizDto Quiz,
    LearnLabChallengeDto LabChallenge,
    LearnUnitProgressDto Progress);

public sealed record LearnLessonBlockDto(int Id, int Order, string? TitleKey, string BodyKey);

public sealed record LearnQuizDto(
    int PassCount,
    IReadOnlyList<LearnQuizQuestionDto> Questions);

public sealed record LearnQuizQuestionDto(
    int Id,
    int Order,
    string PromptKey,
    IReadOnlyList<LearnQuizOptionDto> Options);

public sealed record LearnQuizOptionDto(string Id, string LabelKey);

public sealed record LearnLabChallengeDto(IReadOnlyList<LearnLabCriterionDto> Criteria);

public sealed record LearnLabCriterionDto(
    int Id,
    int Order,
    string LabelKey,
    string Type,
    string ParamsJson);

public sealed record LearnProgressSnapshotResponse(
    Guid SessionId,
    IReadOnlyList<LearnUnitProgressDto> Units);

public sealed record LearnUnitProgressDto(
    string ModuleSlug,
    string UnitSlug,
    bool ReadComplete,
    bool QuizPassed,
    bool LabPassed,
    bool Complete);

public sealed record MarkReadRequest(bool Complete);

public sealed record QuizSubmitRequest(IReadOnlyDictionary<int, string> Answers);

public sealed record QuizSubmitResponse(
    bool Passed,
    int CorrectCount,
    int TotalCount,
    IReadOnlyList<QuizQuestionResultDto> Results);

public sealed record QuizQuestionResultDto(
    int QuestionId,
    bool Correct,
    string CorrectOptionId,
    string ExplanationKey);

public sealed record LabVerifyRequest(IReadOnlyList<LabCriterionResultDto> Results);

public sealed record LabCriterionResultDto(int CriterionId, bool Passed);

public sealed record LabVerifyResponse(bool Passed, LearnUnitProgressDto Progress);

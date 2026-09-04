using ElectroLab.LearningApi.Contracts;

namespace ElectroLab.LearningApi.Services;

/// <summary>
/// Shape validation for client-supplied bodies. Runs before any DB access so malformed
/// input can never reach a null dereference. Semantic checks (unknown ids) live in the service.
/// </summary>
public static class LearnRequestValidation
{
    public const int MaxQuizAnswers = 200;
    public const int MaxLabResults = 200;
    public const int MaxOptionIdLength = 16;

    public static LearnRejection? ValidateQuiz(QuizSubmitRequest? request)
    {
        if (request?.Answers is null)
            return LearnRejection.Invalid(LearnRejectionReasons.MissingBody, "Request body must contain an 'answers' object.");

        if (request.Answers.Count > MaxQuizAnswers)
            return LearnRejection.Invalid(LearnRejectionReasons.TooManyEntries, $"At most {MaxQuizAnswers} answers are accepted.");

        foreach (var (questionId, choice) in request.Answers)
        {
            if (choice is null || choice.Length == 0 || choice.Length > MaxOptionIdLength)
                return LearnRejection.Invalid(LearnRejectionReasons.InvalidAnswer, $"Answer for question {questionId} is empty or too long.");
        }

        return null;
    }

    public static LearnRejection? ValidateLab(LabVerifyRequest? request)
    {
        if (request?.Results is null)
            return LearnRejection.Invalid(LearnRejectionReasons.MissingBody, "Request body must contain a 'results' array.");

        if (request.Results.Count > MaxLabResults)
            return LearnRejection.Invalid(LearnRejectionReasons.TooManyEntries, $"At most {MaxLabResults} criterion results are accepted.");

        var seen = new HashSet<int>();
        foreach (var result in request.Results)
        {
            if (result is null)
                return LearnRejection.Invalid(LearnRejectionReasons.MissingBody, "Criterion results must not contain null entries.");
            if (!seen.Add(result.CriterionId))
                return LearnRejection.Invalid(LearnRejectionReasons.DuplicateCriterion, $"Criterion {result.CriterionId} was submitted more than once.");
        }

        return null;
    }
}

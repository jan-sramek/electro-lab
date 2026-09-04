namespace ElectroLab.LearningApi.Services;

public enum LearnRejectionKind
{
    /// <summary>Request shape is wrong (maps to HTTP 400).</summary>
    InvalidRequest,
    /// <summary>Request conflicts with current progress state (maps to HTTP 409).</summary>
    Conflict
}

/// <summary>Machine-readable reason codes surfaced in ProblemDetails <c>reason</c> extension.</summary>
public static class LearnRejectionReasons
{
    public const string MissingBody = "missing-body";
    public const string TooManyEntries = "too-many-entries";
    public const string InvalidAnswer = "invalid-answer";
    public const string UnknownQuestion = "unknown-question";
    public const string UnknownCriterion = "unknown-criterion";
    public const string DuplicateCriterion = "duplicate-criterion";
    public const string UnitLocked = "unit-locked";
    public const string QuizRequired = "quiz-required";
}

public sealed record LearnRejection(LearnRejectionKind Kind, string Reason, string Detail)
{
    public static LearnRejection Invalid(string reason, string detail) =>
        new(LearnRejectionKind.InvalidRequest, reason, detail);

    public static LearnRejection Conflict(string reason, string detail) =>
        new(LearnRejectionKind.Conflict, reason, detail);
}

/// <summary>Outcome of a progress mutation: not found, rejected, or a value.</summary>
public sealed class LearnResult<T> where T : class
{
    private LearnResult(T? value, LearnRejection? rejection, bool notFound)
    {
        Value = value;
        Rejection = rejection;
        IsNotFound = notFound;
    }

    public T? Value { get; }
    public LearnRejection? Rejection { get; }
    public bool IsNotFound { get; }
    public bool IsSuccess => Value is not null;

    public static LearnResult<T> Ok(T value) => new(value, null, false);
    public static LearnResult<T> NotFound() => new(null, null, true);
    public static LearnResult<T> Reject(LearnRejection rejection) => new(null, rejection, false);
}

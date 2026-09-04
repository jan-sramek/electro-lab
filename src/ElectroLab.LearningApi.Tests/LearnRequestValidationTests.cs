using ElectroLab.LearningApi.Contracts;
using ElectroLab.LearningApi.Services;

namespace ElectroLab.LearningApi.Tests;

public class LearnRequestValidationTests
{
    [Fact]
    public void Quiz_null_body_or_null_answers_is_rejected()
    {
        Assert.Equal(LearnRejectionReasons.MissingBody, LearnRequestValidation.ValidateQuiz(null)!.Reason);
        Assert.Equal(LearnRejectionReasons.MissingBody, LearnRequestValidation.ValidateQuiz(new QuizSubmitRequest(null!))!.Reason);
    }

    [Fact]
    public void Quiz_size_and_answer_shape_are_limited()
    {
        var tooMany = Enumerable.Range(1, LearnRequestValidation.MaxQuizAnswers + 1).ToDictionary(i => i, _ => "a");
        Assert.Equal(LearnRejectionReasons.TooManyEntries, LearnRequestValidation.ValidateQuiz(new QuizSubmitRequest(tooMany))!.Reason);

        var longAnswer = new Dictionary<int, string> { [1] = new string('x', LearnRequestValidation.MaxOptionIdLength + 1) };
        Assert.Equal(LearnRejectionReasons.InvalidAnswer, LearnRequestValidation.ValidateQuiz(new QuizSubmitRequest(longAnswer))!.Reason);

        var nullAnswer = new Dictionary<int, string> { [1] = null! };
        Assert.Equal(LearnRejectionReasons.InvalidAnswer, LearnRequestValidation.ValidateQuiz(new QuizSubmitRequest(nullAnswer))!.Reason);

        Assert.Null(LearnRequestValidation.ValidateQuiz(new QuizSubmitRequest(new Dictionary<int, string> { [1] = "a" })));
        Assert.Null(LearnRequestValidation.ValidateQuiz(new QuizSubmitRequest(new Dictionary<int, string>())));
    }

    [Fact]
    public void Lab_null_body_null_results_and_null_entries_are_rejected()
    {
        Assert.Equal(LearnRejectionReasons.MissingBody, LearnRequestValidation.ValidateLab(null)!.Reason);
        Assert.Equal(LearnRejectionReasons.MissingBody, LearnRequestValidation.ValidateLab(new LabVerifyRequest(null!))!.Reason);
        Assert.Equal(LearnRejectionReasons.MissingBody, LearnRequestValidation.ValidateLab(new LabVerifyRequest([null!]))!.Reason);
    }

    [Fact]
    public void Lab_duplicate_criterion_ids_and_oversized_lists_are_rejected()
    {
        var dup = new LabVerifyRequest([new(1, true), new(1, true)]);
        Assert.Equal(LearnRejectionReasons.DuplicateCriterion, LearnRequestValidation.ValidateLab(dup)!.Reason);

        var tooMany = new LabVerifyRequest(Enumerable.Range(1, LearnRequestValidation.MaxLabResults + 1)
            .Select(i => new LabCriterionResultDto(i, true)).ToList());
        Assert.Equal(LearnRejectionReasons.TooManyEntries, LearnRequestValidation.ValidateLab(tooMany)!.Reason);

        Assert.Null(LearnRequestValidation.ValidateLab(new LabVerifyRequest([new(1, true), new(2, false)])));
        Assert.Null(LearnRequestValidation.ValidateLab(new LabVerifyRequest([])));
    }
}

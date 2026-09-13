namespace ElectroLab.LearningApi.Services;

/// <summary>Quiz pass rule shared by catalog DTOs and grading (mirrored in the web client).</summary>
public static class LearnQuizRules
{
    /// <summary>
    /// Short formative quizzes (up to 3 questions) must be fully correct. Longer quizzes,
    /// such as a module final, pass at 80 % (rounded up).
    /// </summary>
    public static int PassCountFor(int questionCount) =>
        questionCount <= 3 ? questionCount : (int)Math.Ceiling(questionCount * 0.8);
}

namespace ElectroLab.LearningApi.Data.Entities;

public sealed class LearnModule
{
    public int Id { get; set; }
    public required string Slug { get; set; }
    public required string TitleKey { get; set; }
    public int SortOrder { get; set; }

    public ICollection<LearnUnit> Units { get; set; } = [];
}

public sealed class LearnUnit
{
    public int Id { get; set; }
    public int ModuleId { get; set; }
    public required string Slug { get; set; }
    public required string ExampleId { get; set; }
    public required string I18nKeyPrefix { get; set; }
    public int SortOrder { get; set; }
    public int? NextUnitId { get; set; }

    public LearnModule Module { get; set; } = null!;
    public LearnUnit? NextUnit { get; set; }
    public ICollection<LearnLessonBlock> LessonBlocks { get; set; } = [];
    public ICollection<LearnQuizQuestion> QuizQuestions { get; set; } = [];
    public ICollection<LearnLabCriterion> LabCriteria { get; set; } = [];
}

public sealed class LearnLessonBlock
{
    public int Id { get; set; }
    public int UnitId { get; set; }
    public int SortOrder { get; set; }
    public string? TitleKey { get; set; }
    public required string BodyKey { get; set; }

    public LearnUnit Unit { get; set; } = null!;
}

public sealed class LearnQuizQuestion
{
    public int Id { get; set; }
    public int UnitId { get; set; }
    public int SortOrder { get; set; }
    public required string PromptKey { get; set; }
    /// <summary>JSON array of { "id": "a", "labelKey": "..." }.</summary>
    public required string OptionsJson { get; set; }
    public required string CorrectOptionId { get; set; }
    public required string ExplanationKey { get; set; }

    public LearnUnit Unit { get; set; } = null!;
}

public sealed class LearnLabCriterion
{
    public int Id { get; set; }
    public int UnitId { get; set; }
    public int SortOrder { get; set; }
    public required string LabelKey { get; set; }
    /// <summary>Checker discriminator, e.g. sim_ok, branch_current_min.</summary>
    public required string Type { get; set; }
    /// <summary>JSON params for the client checker.</summary>
    public required string ParamsJson { get; set; }

    public LearnUnit Unit { get; set; } = null!;
}

public sealed class LearnProgressRow
{
    public Guid SessionId { get; set; }
    public int UnitId { get; set; }
    public bool ReadComplete { get; set; }
    public bool QuizPassed { get; set; }
    public bool LabPassed { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public LearnUnit Unit { get; set; } = null!;

    public bool IsComplete => ReadComplete && QuizPassed && LabPassed;
}

using ElectroLab.LearningApi.Data;
using ElectroLab.LearningApi.Data.Entities;
using ElectroLab.LearningApi.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ElectroLab.LearningApi.Tests;

/// <summary>
/// Shared in-memory SQLite database (one open connection keeps it alive) so several
/// <see cref="LearningDbContext"/> instances can observe each other's writes like separate requests would.
/// </summary>
public sealed class SqliteLearningDb : IDisposable
{
    private readonly SqliteConnection _connection;

    public SqliteLearningDb()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        using var db = CreateContext();
        db.Database.EnsureCreated();
    }

    public LearningDbContext CreateContext(params IInterceptor[] interceptors)
    {
        var options = new DbContextOptionsBuilder<LearningDbContext>()
            .UseSqlite(_connection)
            .AddInterceptors(interceptors)
            .Options;
        return new LearningDbContext(options);
    }

    public LearnProgressService CreateProgressService(LearningDbContext db) =>
        new(db, new LearnCatalogService(db));

    /// <summary>Module "m" with unit "u1" (2 questions, 2 criteria) followed by unit "u2" (no questions, no criteria).</summary>
    public async Task<(LearnUnit U1, LearnUnit U2)> SeedTwoUnitModuleAsync()
    {
        await using var db = CreateContext();
        var module = new LearnModule { Slug = "m", TitleKey = "m.title", SortOrder = 1 };
        var u1 = new LearnUnit { Module = module, Slug = "u1", ExampleId = "led", I18nKeyPrefix = "p.u1", SortOrder = 1 };
        var u2 = new LearnUnit { Module = module, Slug = "u2", ExampleId = "led", I18nKeyPrefix = "p.u2", SortOrder = 2 };
        u1.NextUnit = u2;
        u1.QuizQuestions.Add(new LearnQuizQuestion
        {
            SortOrder = 1, PromptKey = "q1", OptionsJson = """[{"Id":"a","LabelKey":"a"},{"Id":"b","LabelKey":"b"}]""",
            CorrectOptionId = "a", ExplanationKey = "e1"
        });
        u1.QuizQuestions.Add(new LearnQuizQuestion
        {
            SortOrder = 2, PromptKey = "q2", OptionsJson = """[{"Id":"a","LabelKey":"a"},{"Id":"b","LabelKey":"b"}]""",
            CorrectOptionId = "b", ExplanationKey = "e2"
        });
        u1.LabCriteria.Add(new LearnLabCriterion { SortOrder = 1, LabelKey = "c1", Type = "sim_ok", ParamsJson = "{}" });
        u1.LabCriteria.Add(new LearnLabCriterion { SortOrder = 2, LabelKey = "c2", Type = "no_circuit_errors", ParamsJson = "{}" });
        db.AddRange(module, u1, u2);
        await db.SaveChangesAsync();
        return (u1, u2);
    }

    public async Task<LearnProgressRow?> GetRowAsync(Guid session, int unitId)
    {
        await using var db = CreateContext();
        return await db.LearnProgress.AsNoTracking()
            .FirstOrDefaultAsync(p => p.SessionId == session && p.UnitId == unitId);
    }

    public async Task SetRowAsync(Guid session, int unitId, bool read, bool quiz, bool lab)
    {
        await using var db = CreateContext();
        var row = await db.LearnProgress.FindAsync(session, unitId);
        if (row is null)
        {
            row = new LearnProgressRow { SessionId = session, UnitId = unitId };
            db.LearnProgress.Add(row);
        }

        row.ReadComplete = read;
        row.QuizPassed = quiz;
        row.LabPassed = lab;
        row.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
    }

    public void Dispose() => _connection.Dispose();
}

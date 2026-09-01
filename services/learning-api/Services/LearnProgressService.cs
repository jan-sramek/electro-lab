using ElectroLab.LearningApi.Contracts;
using ElectroLab.LearningApi.Data;
using ElectroLab.LearningApi.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElectroLab.LearningApi.Services;

public sealed class LearnProgressService(LearningDbContext db)
{
    public async Task<LearnProgressSnapshotResponse> GetSnapshotAsync(Guid sessionId, CancellationToken ct = default)
    {
        var units = await db.LearnUnits
            .AsNoTracking()
            .Include(u => u.Module)
            .OrderBy(u => u.Module.SortOrder)
            .ThenBy(u => u.SortOrder)
            .ToListAsync(ct);

        var progress = await db.LearnProgress
            .AsNoTracking()
            .Where(p => p.SessionId == sessionId)
            .ToDictionaryAsync(p => p.UnitId, ct);

        var dtos = units
            .Select(u =>
            {
                progress.TryGetValue(u.Id, out var row);
                return new LearnUnitProgressDto(
                    u.Module.Slug,
                    u.Slug,
                    row?.ReadComplete ?? false,
                    row?.QuizPassed ?? false,
                    row?.LabPassed ?? false,
                    row?.IsComplete ?? false);
            })
            .ToList();

        return new LearnProgressSnapshotResponse(sessionId, dtos);
    }

    public async Task<LearnUnitProgressDto?> MarkReadAsync(
        Guid sessionId,
        string moduleSlug,
        string unitSlug,
        bool complete,
        CancellationToken ct = default)
    {
        var unit = await FindUnitAsync(moduleSlug, unitSlug, ct);
        if (unit is null) return null;

        var row = await GetOrCreateRowAsync(sessionId, unit.Id, ct);
        row.ReadComplete = complete;
        row.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        return ToDto(unit, row);
    }

    public async Task<QuizSubmitResponse?> SubmitQuizAsync(
        Guid sessionId,
        string moduleSlug,
        string unitSlug,
        QuizSubmitRequest request,
        CancellationToken ct = default)
    {
        var unit = await db.LearnUnits
            .Include(u => u.QuizQuestions)
            .Include(u => u.Module)
            .FirstOrDefaultAsync(u => u.Module.Slug == moduleSlug && u.Slug == unitSlug, ct);
        if (unit is null) return null;

        var questions = unit.QuizQuestions.OrderBy(q => q.SortOrder).ToList();
        if (questions.Count == 0)
            return new QuizSubmitResponse(true, 0, 0, []);

        var results = new List<QuizQuestionResultDto>();
        var correct = 0;
        foreach (var q in questions)
        {
            var answered = request.Answers.TryGetValue(q.Id, out var choice);
            var isCorrect = answered && string.Equals(choice, q.CorrectOptionId, StringComparison.Ordinal);
            if (isCorrect) correct++;
            results.Add(new QuizQuestionResultDto(q.Id, isCorrect, q.CorrectOptionId, q.ExplanationKey));
        }

        var passed = correct == questions.Count;
        var row = await GetOrCreateRowAsync(sessionId, unit.Id, ct);
        if (passed) row.QuizPassed = true;
        row.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        return new QuizSubmitResponse(passed, correct, questions.Count, results);
    }

    public async Task<LabVerifyResponse?> VerifyLabAsync(
        Guid sessionId,
        string moduleSlug,
        string unitSlug,
        LabVerifyRequest request,
        CancellationToken ct = default)
    {
        var unit = await db.LearnUnits
            .Include(u => u.LabCriteria)
            .Include(u => u.Module)
            .FirstOrDefaultAsync(u => u.Module.Slug == moduleSlug && u.Slug == unitSlug, ct);
        if (unit is null) return null;

        var criteriaIds = unit.LabCriteria.Select(c => c.Id).ToHashSet();
        var submitted = request.Results.Where(r => criteriaIds.Contains(r.CriterionId)).ToList();
        var passed = criteriaIds.Count > 0
            && submitted.Count == criteriaIds.Count
            && submitted.All(r => r.Passed);

        var row = await GetOrCreateRowAsync(sessionId, unit.Id, ct);
        if (passed) row.LabPassed = true;
        row.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        return new LabVerifyResponse(passed, ToDto(unit, row));
    }

    private async Task<LearnUnit?> FindUnitAsync(string moduleSlug, string unitSlug, CancellationToken ct) =>
        await db.LearnUnits
            .Include(u => u.Module)
            .FirstOrDefaultAsync(u => u.Module.Slug == moduleSlug && u.Slug == unitSlug, ct);

    private async Task<LearnProgressRow> GetOrCreateRowAsync(Guid sessionId, int unitId, CancellationToken ct)
    {
        var row = await db.LearnProgress
            .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.UnitId == unitId, ct);
        if (row is not null) return row;

        row = new LearnProgressRow
        {
            SessionId = sessionId,
            UnitId = unitId,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        db.LearnProgress.Add(row);
        return row;
    }

    private static LearnUnitProgressDto ToDto(LearnUnit unit, LearnProgressRow row) =>
        new(unit.Module.Slug, unit.Slug, row.ReadComplete, row.QuizPassed, row.LabPassed, row.IsComplete);
}

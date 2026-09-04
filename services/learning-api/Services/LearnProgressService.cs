using System.Data.Common;
using ElectroLab.LearningApi.Contracts;
using ElectroLab.LearningApi.Data;
using ElectroLab.LearningApi.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace ElectroLab.LearningApi.Services;

public sealed class LearnProgressService(LearningDbContext db, LearnCatalogService catalog)
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

    public async Task<LearnResult<LearnUnitProgressDto>> MarkReadAsync(
        Guid sessionId,
        string moduleSlug,
        string unitSlug,
        bool complete,
        CancellationToken ct = default)
    {
        var unit = await FindUnitAsync(moduleSlug, unitSlug, ct);
        if (unit is null) return LearnResult<LearnUnitProgressDto>.NotFound();

        if (complete && await IsLockedAsync(unit, sessionId, ct))
            return LearnResult<LearnUnitProgressDto>.Reject(UnitLocked());

        var row = await UpsertRowAsync(sessionId, unit.Id, r => r.ReadComplete = complete, ct);
        return LearnResult<LearnUnitProgressDto>.Ok(ToDto(unit, row));
    }

    public async Task<LearnResult<QuizSubmitResponse>> SubmitQuizAsync(
        Guid sessionId,
        string moduleSlug,
        string unitSlug,
        QuizSubmitRequest? request,
        CancellationToken ct = default)
    {
        if (LearnRequestValidation.ValidateQuiz(request) is { } invalid)
            return LearnResult<QuizSubmitResponse>.Reject(invalid);

        var unit = await db.LearnUnits
            .AsNoTracking()
            .AsSplitQuery()
            .Include(u => u.QuizQuestions)
            .Include(u => u.Module)
            .FirstOrDefaultAsync(u => u.Module.Slug == moduleSlug && u.Slug == unitSlug, ct);
        if (unit is null) return LearnResult<QuizSubmitResponse>.NotFound();

        if (await IsLockedAsync(unit, sessionId, ct))
            return LearnResult<QuizSubmitResponse>.Reject(UnitLocked());

        var questions = unit.QuizQuestions.OrderBy(q => q.SortOrder).ToList();
        var questionIds = questions.Select(q => q.Id).ToHashSet();
        foreach (var questionId in request!.Answers.Keys)
        {
            if (!questionIds.Contains(questionId))
            {
                return LearnResult<QuizSubmitResponse>.Reject(LearnRejection.Invalid(
                    LearnRejectionReasons.UnknownQuestion,
                    $"Question {questionId} does not belong to this unit."));
            }
        }

        var results = new List<QuizQuestionResultDto>(questions.Count);
        var correct = 0;
        foreach (var q in questions)
        {
            var answered = request.Answers.TryGetValue(q.Id, out var choice);
            var isCorrect = answered && string.Equals(choice, q.CorrectOptionId, StringComparison.Ordinal);
            if (isCorrect) correct++;
            results.Add(new QuizQuestionResultDto(q.Id, isCorrect, q.CorrectOptionId, q.ExplanationKey));
        }

        // An empty quiz is trivially passed; persist it so the unit can still reach Complete.
        var passed = correct == questions.Count;
        await UpsertRowAsync(sessionId, unit.Id, r => r.QuizPassed |= passed, ct);

        return LearnResult<QuizSubmitResponse>.Ok(new QuizSubmitResponse(passed, correct, questions.Count, results));
    }

    public async Task<LearnResult<LabVerifyResponse>> VerifyLabAsync(
        Guid sessionId,
        string moduleSlug,
        string unitSlug,
        LabVerifyRequest? request,
        CancellationToken ct = default)
    {
        if (LearnRequestValidation.ValidateLab(request) is { } invalid)
            return LearnResult<LabVerifyResponse>.Reject(invalid);

        var unit = await db.LearnUnits
            .AsNoTracking()
            .AsSplitQuery()
            .Include(u => u.LabCriteria)
            .Include(u => u.Module)
            .FirstOrDefaultAsync(u => u.Module.Slug == moduleSlug && u.Slug == unitSlug, ct);
        if (unit is null) return LearnResult<LabVerifyResponse>.NotFound();

        if (await IsLockedAsync(unit, sessionId, ct))
            return LearnResult<LabVerifyResponse>.Reject(UnitLocked());

        var criteriaIds = unit.LabCriteria.Select(c => c.Id).ToHashSet();
        foreach (var result in request!.Results)
        {
            if (!criteriaIds.Contains(result.CriterionId))
            {
                return LearnResult<LabVerifyResponse>.Reject(LearnRejection.Invalid(
                    LearnRejectionReasons.UnknownCriterion,
                    $"Criterion {result.CriterionId} does not belong to this unit."));
            }
        }

        // Server-side gating: the lab can only be passed once the lesson is read and the quiz passed.
        var existing = await db.LearnProgress
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.UnitId == unit.Id, ct);
        if (existing is null || !existing.ReadComplete || !existing.QuizPassed)
        {
            return LearnResult<LabVerifyResponse>.Reject(LearnRejection.Conflict(
                LearnRejectionReasons.QuizRequired,
                "Read the lesson and pass the quiz before verifying the lab challenge."));
        }

        // Duplicates are rejected by validation, so distinct ids == submitted count; require exact coverage.
        var submittedIds = request.Results.Select(r => r.CriterionId).ToHashSet();
        var passed = submittedIds.SetEquals(criteriaIds) && request.Results.All(r => r.Passed);

        var row = await UpsertRowAsync(sessionId, unit.Id, r => r.LabPassed |= passed, ct);
        return LearnResult<LabVerifyResponse>.Ok(new LabVerifyResponse(passed, ToDto(unit, row)));
    }

    private async Task<bool> IsLockedAsync(LearnUnit unit, Guid sessionId, CancellationToken ct) =>
        await catalog.GetAvailabilityAsync(unit, sessionId, ct) == UnitAvailability.Locked;

    private static LearnRejection UnitLocked() =>
        LearnRejection.Conflict(LearnRejectionReasons.UnitLocked, "Complete the previous unit before working on this one.");

    private async Task<LearnUnit?> FindUnitAsync(string moduleSlug, string unitSlug, CancellationToken ct) =>
        await db.LearnUnits
            .AsNoTracking()
            .Include(u => u.Module)
            .FirstOrDefaultAsync(u => u.Module.Slug == moduleSlug && u.Slug == unitSlug, ct);

    /// <summary>
    /// Read-or-insert the (session, unit) progress row, apply <paramref name="mutate"/>, and save.
    /// Two concurrent first writes for the same key race on the composite PK; the loser gets a unique
    /// violation, detaches its phantom insert, re-reads the winner's row and applies its change on top.
    /// </summary>
    private async Task<LearnProgressRow> UpsertRowAsync(
        Guid sessionId,
        int unitId,
        Action<LearnProgressRow> mutate,
        CancellationToken ct)
    {
        var row = await db.LearnProgress
            .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.UnitId == unitId, ct);

        if (row is null)
        {
            row = new LearnProgressRow { SessionId = sessionId, UnitId = unitId };
            db.LearnProgress.Add(row);
            mutate(row);
            row.UpdatedAt = DateTimeOffset.UtcNow;

            try
            {
                await db.SaveChangesAsync(ct);
                return row;
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex))
            {
                db.Entry(row).State = EntityState.Detached;
                row = await db.LearnProgress
                    .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.UnitId == unitId, ct)
                    ?? throw new InvalidOperationException(
                        "Progress insert failed with a unique violation but the row could not be re-read.", ex);
            }
        }

        mutate(row);
        row.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return row;
    }

    private static bool IsUniqueViolation(DbUpdateException ex)
    {
        if (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
            return true;

        // Provider-agnostic fallback (e.g. SQLite in tests): a failed insert of a progress row whose
        // driver reports a unique/primary-key constraint failure.
        return ex.InnerException is DbException inner
            && ex.Entries.Any(e => e.Entity is LearnProgressRow && e.State == EntityState.Added)
            && inner.Message.Contains("unique", StringComparison.OrdinalIgnoreCase);
    }

    private static LearnUnitProgressDto ToDto(LearnUnit unit, LearnProgressRow row) =>
        new(unit.Module.Slug, unit.Slug, row.ReadComplete, row.QuizPassed, row.LabPassed, row.IsComplete);
}

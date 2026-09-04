using System.Text.Json;
using ElectroLab.LearningApi.Contracts;
using ElectroLab.LearningApi.Data;
using ElectroLab.LearningApi.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElectroLab.LearningApi.Services;

public sealed class LearnCatalogService(LearningDbContext db)
{
    public async Task<LearnCatalogResponse> GetCatalogAsync(Guid sessionId, CancellationToken ct = default)
    {
        var modules = await LoadModulesAsync(ct);
        var progress = await LoadProgressMapAsync(sessionId, ct);
        var orderedUnits = FlattenUnits(modules);

        var moduleDtos = modules
            .OrderBy(m => m.SortOrder)
            .ThenBy(m => m.Id)
            .Select(m => new LearnModuleDto(
                m.Slug,
                m.TitleKey,
                m.SortOrder,
                m.Units
                    .OrderBy(u => u.SortOrder)
                    .ThenBy(u => u.Id)
                    .Select(u => ToSummary(u, progress, orderedUnits))
                    .ToList()))
            .ToList();

        return new LearnCatalogResponse(moduleDtos);
    }

    public async Task<LearnUnitDetailResponse?> GetUnitAsync(
        string moduleSlug,
        string unitSlug,
        Guid sessionId,
        CancellationToken ct = default)
    {
        var unit = await FindUnitAsync(moduleSlug, unitSlug, ct);
        if (unit is null) return null;

        var (row, availability) = await LoadAvailabilityAsync(unit, sessionId, ct);

        return new LearnUnitDetailResponse(
            unit.Module.Slug,
            unit.Slug,
            unit.ExampleId,
            unit.I18nKeyPrefix,
            unit.SortOrder,
            unit.NextUnit?.Module.Slug,
            unit.NextUnit?.Slug,
            availability,
            unit.LessonBlocks
                .OrderBy(b => b.SortOrder)
                .Select(b => new LearnLessonBlockDto(b.Id, b.SortOrder, b.TitleKey, b.BodyKey))
                .ToList(),
            BuildQuiz(unit),
            BuildLabChallenge(unit),
            ToProgressDto(unit, row));
    }

    /// <summary>
    /// Availability of a single unit for a session, loading only the unit's predecessor id and the
    /// two relevant progress rows. Shared with <see cref="LearnProgressService"/> for server-side gating.
    /// </summary>
    public async Task<UnitAvailability> GetAvailabilityAsync(LearnUnit unit, Guid sessionId, CancellationToken ct = default)
    {
        var (_, availability) = await LoadAvailabilityAsync(unit, sessionId, ct);
        return availability;
    }

    private async Task<(LearnProgressRow? Row, UnitAvailability Availability)> LoadAvailabilityAsync(
        LearnUnit unit,
        Guid sessionId,
        CancellationToken ct)
    {
        var predecessorId = await FindPredecessorIdAsync(unit, ct);

        var ids = predecessorId is int p ? new[] { unit.Id, p } : [unit.Id];
        var rows = await db.LearnProgress
            .AsNoTracking()
            .Where(r => r.SessionId == sessionId && ids.Contains(r.UnitId))
            .ToListAsync(ct);

        var row = rows.FirstOrDefault(r => r.UnitId == unit.Id);
        var prevRow = predecessorId is int pid ? rows.FirstOrDefault(r => r.UnitId == pid) : null;
        return (row, ResolveAvailability(row, predecessorId.HasValue, prevRow));
    }

    /// <summary>The unit immediately before <paramref name="unit"/> in global (module order, unit order) sequence.</summary>
    private async Task<int?> FindPredecessorIdAsync(LearnUnit unit, CancellationToken ct)
    {
        var moduleOrder = unit.Module?.SortOrder
            ?? await db.LearnModules.AsNoTracking()
                .Where(m => m.Id == unit.ModuleId)
                .Select(m => m.SortOrder)
                .FirstAsync(ct);
        var moduleId = unit.ModuleId;
        var unitOrder = unit.SortOrder;
        var unitId = unit.Id;

        return await db.LearnUnits
            .AsNoTracking()
            .Where(u =>
                u.Module.SortOrder < moduleOrder
                || (u.Module.SortOrder == moduleOrder && u.ModuleId < moduleId)
                || (u.ModuleId == moduleId && u.SortOrder < unitOrder)
                || (u.ModuleId == moduleId && u.SortOrder == unitOrder && u.Id < unitId))
            .OrderByDescending(u => u.Module.SortOrder)
            .ThenByDescending(u => u.ModuleId)
            .ThenByDescending(u => u.SortOrder)
            .ThenByDescending(u => u.Id)
            .Select(u => (int?)u.Id)
            .FirstOrDefaultAsync(ct);
    }

    // Catalog summaries only need unit scalars plus the next unit's module slug; lesson/quiz/criteria
    // collections are deliberately not loaded here (they caused a cartesian explosion).
    private async Task<List<LearnModule>> LoadModulesAsync(CancellationToken ct) =>
        await db.LearnModules
            .AsNoTracking()
            .AsSplitQuery()
            .Include(m => m.Units.OrderBy(u => u.SortOrder).ThenBy(u => u.Id))
                .ThenInclude(u => u.NextUnit!)
                    .ThenInclude(n => n.Module)
            .OrderBy(m => m.SortOrder)
            .ThenBy(m => m.Id)
            .ToListAsync(ct);

    private async Task<LearnUnit?> FindUnitAsync(string moduleSlug, string unitSlug, CancellationToken ct) =>
        await db.LearnUnits
            .AsNoTracking()
            .AsSplitQuery()
            .Include(u => u.Module)
            .Include(u => u.NextUnit!)
                .ThenInclude(n => n.Module)
            .Include(u => u.LessonBlocks)
            .Include(u => u.QuizQuestions)
            .Include(u => u.LabCriteria)
            .FirstOrDefaultAsync(u => u.Module.Slug == moduleSlug && u.Slug == unitSlug, ct);

    private async Task<Dictionary<int, LearnProgressRow>> LoadProgressMapAsync(Guid sessionId, CancellationToken ct)
    {
        var rows = await db.LearnProgress
            .AsNoTracking()
            .Where(p => p.SessionId == sessionId)
            .ToListAsync(ct);
        return rows.ToDictionary(r => r.UnitId);
    }

    private static List<LearnUnit> FlattenUnits(IEnumerable<LearnModule> modules) =>
        modules
            .OrderBy(m => m.SortOrder)
            .ThenBy(m => m.Id)
            .SelectMany(m => m.Units.OrderBy(u => u.SortOrder).ThenBy(u => u.Id))
            .ToList();

    private static LearnUnitSummaryDto ToSummary(
        LearnUnit unit,
        IReadOnlyDictionary<int, LearnProgressRow> progress,
        IReadOnlyList<LearnUnit> orderedUnits) =>
        new(
            unit.Module.Slug,
            unit.Slug,
            unit.ExampleId,
            unit.I18nKeyPrefix,
            unit.SortOrder,
            unit.NextUnit?.Module.Slug,
            unit.NextUnit?.Slug,
            ResolveAvailability(unit, progress, orderedUnits));

    private static UnitAvailability ResolveAvailability(
        LearnUnit unit,
        IReadOnlyDictionary<int, LearnProgressRow> progress,
        IReadOnlyList<LearnUnit> orderedUnits)
    {
        var index = -1;
        for (var i = 0; i < orderedUnits.Count; i++)
        {
            if (orderedUnits[i].Id == unit.Id)
            {
                index = i;
                break;
            }
        }

        var row = progress.GetValueOrDefault(unit.Id);
        var prevRow = index > 0 ? progress.GetValueOrDefault(orderedUnits[index - 1].Id) : null;
        return ResolveAvailability(row, hasPredecessor: index > 0, prevRow);
    }

    /// <summary>Single source of truth for the unlock rule: first unit is open, later units need the previous one complete.</summary>
    public static UnitAvailability ResolveAvailability(LearnProgressRow? row, bool hasPredecessor, LearnProgressRow? predecessorRow)
    {
        if (row is not null)
        {
            if (row.IsComplete) return UnitAvailability.Complete;
            if (row.ReadComplete || row.QuizPassed || row.LabPassed) return UnitAvailability.InProgress;
        }

        if (!hasPredecessor) return UnitAvailability.Available;
        return predecessorRow?.IsComplete == true ? UnitAvailability.Available : UnitAvailability.Locked;
    }

    private static LearnQuizDto BuildQuiz(LearnUnit unit)
    {
        var questions = unit.QuizQuestions
            .OrderBy(q => q.SortOrder)
            .Select(q => new LearnQuizQuestionDto(
                q.Id,
                q.SortOrder,
                q.PromptKey,
                ParseOptions(q.OptionsJson)))
            .ToList();
        return new LearnQuizDto(questions.Count, questions);
    }

    private static LearnLabChallengeDto BuildLabChallenge(LearnUnit unit) =>
        new(unit.LabCriteria
            .OrderBy(c => c.SortOrder)
            .Select(c => new LearnLabCriterionDto(c.Id, c.SortOrder, c.LabelKey, c.Type, c.ParamsJson))
            .ToList());

    private static LearnUnitProgressDto ToProgressDto(LearnUnit unit, LearnProgressRow? row) =>
        new(
            unit.Module.Slug,
            unit.Slug,
            row?.ReadComplete ?? false,
            row?.QuizPassed ?? false,
            row?.LabPassed ?? false,
            row?.IsComplete ?? false);

    private static IReadOnlyList<LearnQuizOptionDto> ParseOptions(string json)
    {
        var options = JsonSerializer.Deserialize<List<QuizOptionSeed>>(json) ?? [];
        return options.Select(o => new LearnQuizOptionDto(o.Id, o.LabelKey)).ToList();
    }

    private sealed record QuizOptionSeed(string Id, string LabelKey);
}

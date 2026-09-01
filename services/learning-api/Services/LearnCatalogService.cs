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
            .Select(m => new LearnModuleDto(
                m.Slug,
                m.TitleKey,
                m.SortOrder,
                m.Units
                    .OrderBy(u => u.SortOrder)
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

        var modules = await LoadModulesAsync(ct);
        var progress = await LoadProgressMapAsync(sessionId, ct);
        var orderedUnits = FlattenUnits(modules);
        var row = progress.GetValueOrDefault(unit.Id);

        return new LearnUnitDetailResponse(
            unit.Module.Slug,
            unit.Slug,
            unit.ExampleId,
            unit.I18nKeyPrefix,
            unit.SortOrder,
            unit.NextUnit?.Module.Slug,
            unit.NextUnit?.Slug,
            ResolveAvailability(unit, progress, orderedUnits),
            unit.LessonBlocks
                .OrderBy(b => b.SortOrder)
                .Select(b => new LearnLessonBlockDto(b.Id, b.SortOrder, b.TitleKey, b.BodyKey))
                .ToList(),
            BuildQuiz(unit),
            BuildLabChallenge(unit),
            ToProgressDto(unit, row));
    }

    private async Task<List<LearnModule>> LoadModulesAsync(CancellationToken ct) =>
        await db.LearnModules
            .AsNoTracking()
            .Include(m => m.Units.OrderBy(u => u.SortOrder))
                .ThenInclude(u => u.NextUnit!)
                    .ThenInclude(n => n.Module)
            .Include(m => m.Units)
                .ThenInclude(u => u.LessonBlocks)
            .Include(m => m.Units)
                .ThenInclude(u => u.QuizQuestions)
            .Include(m => m.Units)
                .ThenInclude(u => u.LabCriteria)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(ct);

    private async Task<LearnUnit?> FindUnitAsync(string moduleSlug, string unitSlug, CancellationToken ct) =>
        await db.LearnUnits
            .AsNoTracking()
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
            .SelectMany(m => m.Units.OrderBy(u => u.SortOrder))
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
        if (progress.TryGetValue(unit.Id, out var row))
        {
            if (row.IsComplete) return UnitAvailability.Complete;
            if (row.ReadComplete || row.QuizPassed || row.LabPassed) return UnitAvailability.InProgress;
        }

        var index = -1;
        for (var i = 0; i < orderedUnits.Count; i++)
        {
            if (orderedUnits[i].Id == unit.Id)
            {
                index = i;
                break;
            }
        }

        if (index <= 0) return UnitAvailability.Available;

        var prev = orderedUnits[index - 1];
        if (progress.TryGetValue(prev.Id, out var prevRow) && prevRow.IsComplete)
            return UnitAvailability.Available;

        return UnitAvailability.Locked;
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

using System.Text.Json;
using ElectroLab.LearningApi.Data;
using ElectroLab.LearningApi.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElectroLab.LearningApi.Seed;

/// <summary>
/// Idempotent catalog seed. Structure mirrors <c>apps/web/.../learn-catalog.ts</c>.
/// </summary>
public static class LearnCatalogSeeder
{
    public static async Task SeedAsync(LearningDbContext db)
    {
        if (await db.LearnModules.AnyAsync()) return;

        var moduleIds = new Dictionary<string, int>();
        foreach (var def in ModuleDefs)
        {
            var module = new LearnModule
            {
                Slug = def.Slug,
                TitleKey = def.TitleKey,
                SortOrder = def.Order
            };
            db.LearnModules.Add(module);
            await db.SaveChangesAsync();
            moduleIds[def.Slug] = module.Id;
        }

        var unitIds = new List<int>();
        foreach (var def in UnitDefs)
        {
            var unit = new LearnUnit
            {
                ModuleId = moduleIds[def.ModuleSlug],
                Slug = def.UnitSlug,
                ExampleId = def.ExampleId,
                I18nKeyPrefix = def.I18nKeyPrefix,
                SortOrder = def.Order
            };
            db.LearnUnits.Add(unit);
            await db.SaveChangesAsync();
            unitIds.Add(unit.Id);

            foreach (var (order, titleKey, bodyKey) in def.Lessons)
            {
                db.LearnLessonBlocks.Add(new LearnLessonBlock
                {
                    UnitId = unit.Id,
                    SortOrder = order,
                    TitleKey = titleKey,
                    BodyKey = bodyKey
                });
            }

            for (var qi = 0; qi < def.Quiz.Length; qi++)
            {
                var q = def.Quiz[qi];
                db.LearnQuizQuestions.Add(new LearnQuizQuestion
                {
                    UnitId = unit.Id,
                    SortOrder = qi + 1,
                    PromptKey = q.PromptKey,
                    OptionsJson = JsonSerializer.Serialize(q.Options),
                    CorrectOptionId = q.CorrectId,
                    ExplanationKey = q.ExplainKey
                });
            }

            for (var ci = 0; ci < def.LabCriteria.Length; ci++)
            {
                var c = def.LabCriteria[ci];
                db.LearnLabCriteria.Add(new LearnLabCriterion
                {
                    UnitId = unit.Id,
                    SortOrder = ci + 1,
                    LabelKey = c.LabelKey,
                    Type = c.Type,
                    ParamsJson = JsonSerializer.Serialize(c.Params)
                });
            }
        }

        await db.SaveChangesAsync();

        for (var i = 0; i < unitIds.Count - 1; i++)
        {
            var unit = await db.LearnUnits.FindAsync(unitIds[i]);
            if (unit is null) continue;
            unit.NextUnitId = unitIds[i + 1];
        }

        await db.SaveChangesAsync();
    }

    private sealed record ModuleDef(string Slug, string TitleKey, int Order);

    private sealed record QuizOptionDef(string Id, string LabelKey);

    private sealed record QuizDef(
        string PromptKey,
        QuizOptionDef[] Options,
        string CorrectId,
        string ExplainKey);

    private sealed record LabCriterionDef(string LabelKey, string Type, object Params);

    private sealed record UnitDef(
        string ModuleSlug,
        string UnitSlug,
        string ExampleId,
        string I18nKeyPrefix,
        int Order,
        (int Order, string? TitleKey, string BodyKey)[] Lessons,
        QuizDef[] Quiz,
        LabCriterionDef[] LabCriteria);

    private static readonly ModuleDef[] ModuleDefs =
    [
        new("basics", "learn.module.basics.title", 1),
        new("switching", "learn.module.switching.title", 2),
        new("timing", "learn.module.timing.title", 3),
        new("input", "learn.module.input.title", 4),
        new("actuators", "learn.module.actuators.title", 5),
        new("mcu", "learn.module.mcu.title", 6),
        new("buses", "learn.module.buses.title", 7)
    ];

    private static QuizDef[] StandardQuiz(string prefix) =>
    [
        new($"{prefix}.quiz.q1.prompt",
            [new("a", $"{prefix}.quiz.q1.a"), new("b", $"{prefix}.quiz.q1.b"), new("c", $"{prefix}.quiz.q1.c")],
            "a", $"{prefix}.quiz.q1.explain"),
        new($"{prefix}.quiz.q2.prompt",
            [new("a", $"{prefix}.quiz.q2.a"), new("b", $"{prefix}.quiz.q2.b"), new("c", $"{prefix}.quiz.q2.c")],
            "b", $"{prefix}.quiz.q2.explain"),
        new($"{prefix}.quiz.q3.prompt",
            [new("a", $"{prefix}.quiz.q3.a"), new("b", $"{prefix}.quiz.q3.b"), new("c", $"{prefix}.quiz.q3.c")],
            "c", $"{prefix}.quiz.q3.explain")
    ];

    private static (int, string?, string)[] StandardLessons(string prefix) =>
    [
        (1, $"{prefix}.lesson1.title", $"{prefix}.lesson1.body"),
        (2, $"{prefix}.lesson2.title", $"{prefix}.lesson2.body")
    ];

    private static LabCriterionDef[] LedLab(string prefix) =>
    [
        new($"{prefix}.challenge.c1.label", "sim_ok", new { }),
        new($"{prefix}.challenge.c2.label", "branch_current_min", new { refId = "D1", minAmps = 0.001 })
    ];

    private static LabCriterionDef[] SwitchLab(string prefix, string switchRef) =>
    [
        new($"{prefix}.challenge.c1.label", "sim_ok", new { }),
        new($"{prefix}.challenge.c2.label", "switch_state", new { refId = switchRef, closed = true })
    ];

    private static readonly UnitDef[] UnitDefs =
    [
        new("basics", "led-series", "led", "learn.project.led", 1,
            StandardLessons("learn.project.led"), StandardQuiz("learn.project.led"), LedLab("learn.project.led")),
        new("basics", "rc-charge", "rc", "learn.project.rc", 2,
            StandardLessons("learn.project.rc"), StandardQuiz("learn.project.rc"),
            [new("learn.project.rc.challenge.c1.label", "sim_ok", new { }),
             new("learn.project.rc.challenge.c2.label", "analysis_mode", new { mode = "tran" })]),
        new("basics", "led-fade", "ledFade", "learn.project.ledFade", 3,
            StandardLessons("learn.project.ledFade"), StandardQuiz("learn.project.ledFade"),
            [new("learn.project.ledFade.challenge.c1.label", "sim_ok", new { }),
             new("learn.project.ledFade.challenge.c2.label", "analysis_mode", new { mode = "tran" })]),
        new("switching", "bjt-switch", "bjt", "learn.project.bc547", 1,
            StandardLessons("learn.project.bc547"), StandardQuiz("learn.project.bc547"),
            SwitchLab("learn.project.bc547", "S1")),
        new("switching", "relay-flyback", "relay", "learn.project.relay", 2,
            StandardLessons("learn.project.relay"), StandardQuiz("learn.project.relay"),
            SwitchLab("learn.project.relay", "S1")),
        new("switching", "nmos-switch", "nmos", "learn.project.nmos", 3,
            StandardLessons("learn.project.nmos"), StandardQuiz("learn.project.nmos"),
            SwitchLab("learn.project.nmos", "S1")),
        new("switching", "motor-lowside", "motor", "learn.project.motor", 4,
            StandardLessons("learn.project.motor"), StandardQuiz("learn.project.motor"),
            SwitchLab("learn.project.motor", "S1")),
        new("timing", "ne555-astable", "ne555", "learn.project.ne555", 1,
            StandardLessons("learn.project.ne555"), StandardQuiz("learn.project.ne555"),
            [new("learn.project.ne555.challenge.c1.label", "sim_ok", new { }),
             new("learn.project.ne555.challenge.c2.label", "analysis_mode", new { mode = "tran" })]),
        new("input", "pushbutton-led", "pushbutton", "learn.project.pushbutton", 1,
            StandardLessons("learn.project.pushbutton"), StandardQuiz("learn.project.pushbutton"),
            [new("learn.project.pushbutton.challenge.c1.label", "sim_ok", new { }),
             new("learn.project.pushbutton.challenge.c2.label", "branch_current_min", new { refId = "D1", minAmps = 0.001 })]),
        new("input", "ldr-nightlight", "ldr", "learn.project.ldr", 2,
            StandardLessons("learn.project.ldr"), StandardQuiz("learn.project.ldr"), LedLab("learn.project.ldr")),
        new("actuators", "buzzer-button", "buzzer", "learn.project.buzzer", 1,
            StandardLessons("learn.project.buzzer"), StandardQuiz("learn.project.buzzer"),
            SwitchLab("learn.project.buzzer", "S1")),
        new("mcu", "arduino-dio-led", "arduino", "learn.project.arduino", 1,
            StandardLessons("learn.project.arduino"), StandardQuiz("learn.project.arduino"), LedLab("learn.project.arduino")),
        new("buses", "i2c-oled-wiring", "i2cOled", "learn.project.i2cOled", 1,
            StandardLessons("learn.project.i2cOled"), StandardQuiz("learn.project.i2cOled"),
            [new("learn.project.i2cOled.challenge.c1.label", "sim_ok", new { }),
             new("learn.project.i2cOled.challenge.c2.label", "no_circuit_errors", new { })])
    ];
}

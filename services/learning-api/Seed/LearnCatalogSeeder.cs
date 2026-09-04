using System.Text.Json;
using ElectroLab.LearningApi.Data;
using ElectroLab.LearningApi.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElectroLab.LearningApi.Seed;

/// <summary>
/// Idempotent catalog seed. Structure mirrors <c>apps/web/.../learn-catalog.ts</c>.
/// Lab criteria prefer <c>challenge-criteria.json</c> (exported from client SPECS) and upsert on every seed.
/// </summary>
public static class LearnCatalogSeeder
{
    public static async Task SeedAsync(LearningDbContext db)
    {
        var criteriaByUnit = LoadChallengeCriteria();

        var modulesBySlug = await db.LearnModules.ToDictionaryAsync(m => m.Slug);
        foreach (var def in ModuleDefs)
        {
            if (!modulesBySlug.TryGetValue(def.Slug, out var module))
            {
                module = new LearnModule
                {
                    Slug = def.Slug,
                    TitleKey = def.TitleKey,
                    SortOrder = def.Order
                };
                db.LearnModules.Add(module);
                await db.SaveChangesAsync();
                modulesBySlug[def.Slug] = module;
            }
            else
            {
                module.TitleKey = def.TitleKey;
                module.SortOrder = def.Order;
            }
        }

        await db.SaveChangesAsync();

        var moduleIdToSlug = modulesBySlug.ToDictionary(kv => kv.Value.Id, kv => kv.Key);
        var units = await db.LearnUnits.Include(u => u.LabCriteria).ToListAsync();
        var unitsByKey = units.ToDictionary(u => $"{moduleIdToSlug[u.ModuleId]}/{u.Slug}");

        var orderedUnitIds = new List<int>();
        foreach (var def in UnitDefs)
        {
            var key = $"{def.ModuleSlug}/{def.UnitSlug}";
            if (!unitsByKey.TryGetValue(key, out var unit))
            {
                unit = new LearnUnit
                {
                    ModuleId = modulesBySlug[def.ModuleSlug].Id,
                    Slug = def.UnitSlug,
                    ExampleId = def.ExampleId,
                    I18nKeyPrefix = def.I18nKeyPrefix,
                    SortOrder = def.Order
                };
                db.LearnUnits.Add(unit);
                await db.SaveChangesAsync();

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

                await db.SaveChangesAsync();
                unitsByKey[key] = unit;
            }
            else
            {
                unit.ExampleId = def.ExampleId;
                unit.I18nKeyPrefix = def.I18nKeyPrefix;
                unit.SortOrder = def.Order;
                unit.ModuleId = modulesBySlug[def.ModuleSlug].Id;
            }

            SyncLabCriteria(db, unit, ResolveCriteria(def, criteriaByUnit));
            orderedUnitIds.Add(unit.Id);
        }

        await db.SaveChangesAsync();

        for (var i = 0; i < orderedUnitIds.Count; i++)
        {
            var unit = await db.LearnUnits.FindAsync(orderedUnitIds[i]);
            if (unit is null) continue;
            unit.NextUnitId = i < orderedUnitIds.Count - 1 ? orderedUnitIds[i + 1] : null;
        }

        await db.SaveChangesAsync();
    }

    private sealed record CriterionSeed(string LabelKey, string Type, string ParamsJson);

    private sealed record ChallengeCriteriaFileRow(
        string ModuleSlug,
        string UnitSlug,
        ChallengeCriteriaFileCriterion[] Criteria);

    private sealed record ChallengeCriteriaFileCriterion(
        int Order,
        string Type,
        string ParamsJson,
        string LabelKey);

    private static Dictionary<string, CriterionSeed[]> LoadChallengeCriteria()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Seed", "challenge-criteria.json");
        if (!File.Exists(path))
        {
            // Dev: project Seed/ next to content root.
            path = Path.Combine(Directory.GetCurrentDirectory(), "Seed", "challenge-criteria.json");
        }

        if (!File.Exists(path)) return new Dictionary<string, CriterionSeed[]>(StringComparer.Ordinal);

        var json = File.ReadAllText(path);
        var rows = JsonSerializer.Deserialize<ChallengeCriteriaFileRow[]>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? [];

        var map = new Dictionary<string, CriterionSeed[]>(StringComparer.Ordinal);
        foreach (var row in rows)
        {
            var key = $"{row.ModuleSlug}/{row.UnitSlug}";
            map[key] = row.Criteria
                .OrderBy(c => c.Order)
                .Select(c => new CriterionSeed(c.LabelKey, c.Type, c.ParamsJson))
                .ToArray();
        }

        return map;
    }

    private static CriterionSeed[] ResolveCriteria(
        UnitDef def,
        IReadOnlyDictionary<string, CriterionSeed[]> fromJson)
    {
        var key = $"{def.ModuleSlug}/{def.UnitSlug}";
        if (fromJson.TryGetValue(key, out var seeded) && seeded.Length > 0) return seeded;
        return def.LabCriteria
            .Select(c => new CriterionSeed(c.LabelKey, c.Type, JsonSerializer.Serialize(c.Params)))
            .ToArray();
    }

    private static void SyncLabCriteria(LearningDbContext db, LearnUnit unit, CriterionSeed[] desired)
    {
        var existing = unit.LabCriteria.OrderBy(c => c.SortOrder).ToList();
        for (var i = 0; i < desired.Length; i++)
        {
            var d = desired[i];
            if (i < existing.Count)
            {
                var row = existing[i];
                row.SortOrder = i + 1;
                row.LabelKey = d.LabelKey;
                row.Type = d.Type;
                row.ParamsJson = d.ParamsJson;
            }
            else
            {
                db.LearnLabCriteria.Add(new LearnLabCriterion
                {
                    UnitId = unit.Id,
                    SortOrder = i + 1,
                    LabelKey = d.LabelKey,
                    Type = d.Type,
                    ParamsJson = d.ParamsJson
                });
            }
        }

        for (var i = desired.Length; i < existing.Count; i++)
        {
            db.LearnLabCriteria.Remove(existing[i]);
        }
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
        new("power", "learn.module.power.title", 2),
        new("opamps", "learn.module.opamps.title", 3),
        new("filters", "learn.module.filters.title", 4),
        new("motors", "learn.module.motors.title", 5),
        new("digital", "learn.module.digital.title", 6),
        new("sensors", "learn.module.sensors.title", 7),
        new("comms", "learn.module.comms.title", 8),
        new("adc-dac", "learn.module.adcDac.title", 9),
        new("industrial", "learn.module.industrial.title", 10),
        new("switching", "learn.module.switching.title", 11),
        new("timing", "learn.module.timing.title", 12),
        new("input", "learn.module.input.title", 13),
        new("actuators", "learn.module.actuators.title", 14),
        new("mcu", "learn.module.mcu.title", 15),
        new("buses", "learn.module.buses.title", 16)
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
        // Fallback only when challenge-criteria.json is missing this unit.
        new($"{prefix}.challenge.c1.label", "sim_ok", new { }),
        new($"{prefix}.challenge.c2.label", "branch_current_min", new { refId = "D1", minAmps = 0.001 })
    ];

    /** Fallback only — prefer challenge-criteria.json via ResolveCriteria. */
    private static LabCriterionDef[] SwitchLab(string prefix, string switchRef) =>
    [
        new($"{prefix}.challenge.c1.label", "sim_ok", new { }),
        new($"{prefix}.challenge.c2.label", "switch_state", new { refId = switchRef, closed = true })
    ];

    /** Fallback only — prefer challenge-criteria.json via ResolveCriteria. */
    private static LabCriterionDef[] TranLab(string prefix) =>
    [
        new($"{prefix}.challenge.c1.label", "sim_ok", new { }),
        new($"{prefix}.challenge.c2.label", "analysis_mode", new { mode = "tran" })
    ];

    /** Fallback only — prefer challenge-criteria.json via ResolveCriteria. */
    private static LabCriterionDef[] DcSimOk(string prefix) =>
    [
        new($"{prefix}.challenge.c1.label", "sim_ok", new { }),
        new($"{prefix}.challenge.c2.label", "no_circuit_errors", new { })
    ];

    private static readonly UnitDef[] UnitDefs =
    [
        new("basics", "fundamentals-loop", "led", "learn.project.fundamentalsLoop", 1,
            StandardLessons("learn.project.fundamentalsLoop"), StandardQuiz("learn.project.fundamentalsLoop"),
            LedLab("learn.project.fundamentalsLoop")),
        new("basics", "ohm-explore", "led", "learn.project.ohmExplore", 2,
            StandardLessons("learn.project.ohmExplore"), StandardQuiz("learn.project.ohmExplore"),
            LedLab("learn.project.ohmExplore")),
        new("basics", "led-series", "led", "learn.project.led", 3,
            StandardLessons("learn.project.led"), StandardQuiz("learn.project.led"), LedLab("learn.project.led")),
        new("basics", "diode-direction", "diodeDirection", "learn.project.diodeDirection", 4,
            StandardLessons("learn.project.diodeDirection"), StandardQuiz("learn.project.diodeDirection"),
            LedLab("learn.project.diodeDirection")),
        new("basics", "series-parallel-intro", "seriesParallel", "learn.project.seriesParallel", 5,
            StandardLessons("learn.project.seriesParallel"), StandardQuiz("learn.project.seriesParallel"),
            LedLab("learn.project.seriesParallel")),
        new("basics", "series-leds", "seriesLeds", "learn.project.seriesLeds", 6,
            StandardLessons("learn.project.seriesLeds"), StandardQuiz("learn.project.seriesLeds"),
            LedLab("learn.project.seriesLeds")),
        new("basics", "led-burn-limit", "led", "learn.project.ledBurnLimit", 7,
            StandardLessons("learn.project.ledBurnLimit"), StandardQuiz("learn.project.ledBurnLimit"),
            LedLab("learn.project.ledBurnLimit")),
        new("basics", "rc-charge", "rc", "learn.project.rc", 8,
            StandardLessons("learn.project.rc"), StandardQuiz("learn.project.rc"), TranLab("learn.project.rc")),
        new("basics", "time-constant-estimate", "rc", "learn.project.timeConstant", 9,
            StandardLessons("learn.project.timeConstant"), StandardQuiz("learn.project.timeConstant"),
            TranLab("learn.project.timeConstant")),
        new("basics", "led-fade", "ledFade", "learn.project.ledFade", 10,
            StandardLessons("learn.project.ledFade"), StandardQuiz("learn.project.ledFade"), TranLab("learn.project.ledFade")),
        new("basics", "pulse-rc", "pulse", "learn.project.pulseRc", 11,
            StandardLessons("learn.project.pulseRc"), StandardQuiz("learn.project.pulseRc"),
            TranLab("learn.project.pulseRc")),

        new("power", "half-wave-rectifier", "halfWave", "learn.project.halfWave", 1,
            StandardLessons("learn.project.halfWave"), StandardQuiz("learn.project.halfWave"), TranLab("learn.project.halfWave")),
        new("power", "bridge-rectifier", "bridge", "learn.project.bridge", 2,
            StandardLessons("learn.project.bridge"), StandardQuiz("learn.project.bridge"), TranLab("learn.project.bridge")),
        new("power", "filter-capacitor", "filterCap", "learn.project.filterCap", 3,
            StandardLessons("learn.project.filterCap"), StandardQuiz("learn.project.filterCap"), TranLab("learn.project.filterCap")),
        new("power", "zener-regulator", "zener", "learn.project.zener", 4,
            StandardLessons("learn.project.zener"), StandardQuiz("learn.project.zener"), DcSimOk("learn.project.zener")),
        new("power", "linear-7805", "vreg7805", "learn.project.vreg7805", 5,
            StandardLessons("learn.project.vreg7805"), StandardQuiz("learn.project.vreg7805"), DcSimOk("learn.project.vreg7805")),
        new("power", "reverse-polarity", "reversePolarity", "learn.project.reversePolarity", 6,
            StandardLessons("learn.project.reversePolarity"), StandardQuiz("learn.project.reversePolarity"),
            LedLab("learn.project.reversePolarity")),
        new("power", "fuse-protection", "fuseProtect", "learn.project.fuseProtect", 7,
            StandardLessons("learn.project.fuseProtect"), StandardQuiz("learn.project.fuseProtect"), DcSimOk("learn.project.fuseProtect")),
        new("power", "ripple-measure", "ripple", "learn.project.ripple", 8,
            StandardLessons("learn.project.ripple"), StandardQuiz("learn.project.ripple"), TranLab("learn.project.ripple")),
        new("power", "buck-converter", "buck", "learn.project.buck", 9,
            StandardLessons("learn.project.buck"), StandardQuiz("learn.project.buck"), TranLab("learn.project.buck")),
        new("power", "boost-converter", "boost", "learn.project.boost", 10,
            StandardLessons("learn.project.boost"), StandardQuiz("learn.project.boost"), TranLab("learn.project.boost")),

        new("opamps", "opamp-follower", "opampFollower", "learn.project.opampFollower", 1,
            StandardLessons("learn.project.opampFollower"), StandardQuiz("learn.project.opampFollower"),
            DcSimOk("learn.project.opampFollower")),
        new("opamps", "opamp-invert", "opamp", "learn.project.opamp", 2,
            StandardLessons("learn.project.opamp"), StandardQuiz("learn.project.opamp"),
            DcSimOk("learn.project.opamp")),
        new("opamps", "opamp-noninv", "opampNonInv", "learn.project.opampNonInv", 3,
            StandardLessons("learn.project.opampNonInv"), StandardQuiz("learn.project.opampNonInv"),
            DcSimOk("learn.project.opampNonInv")),
        new("opamps", "opamp-comparator", "opampComparator", "learn.project.opampComparator", 4,
            StandardLessons("learn.project.opampComparator"), StandardQuiz("learn.project.opampComparator"),
            DcSimOk("learn.project.opampComparator")),
        new("opamps", "opamp-schmitt", "opampSchmitt", "learn.project.opampSchmitt", 5,
            StandardLessons("learn.project.opampSchmitt"), StandardQuiz("learn.project.opampSchmitt"),
            DcSimOk("learn.project.opampSchmitt")),
        new("opamps", "opamp-summing", "opampSumming", "learn.project.opampSumming", 6,
            StandardLessons("learn.project.opampSumming"), StandardQuiz("learn.project.opampSumming"),
            DcSimOk("learn.project.opampSumming")),
        new("opamps", "opamp-integrator", "opampIntegrator", "learn.project.opampIntegrator", 7,
            StandardLessons("learn.project.opampIntegrator"), StandardQuiz("learn.project.opampIntegrator"),
            TranLab("learn.project.opampIntegrator")),
        new("opamps", "opamp-differentiator", "opampDifferentiator", "learn.project.opampDifferentiator", 8,
            StandardLessons("learn.project.opampDifferentiator"), StandardQuiz("learn.project.opampDifferentiator"),
            TranLab("learn.project.opampDifferentiator")),
        new("opamps", "opamp-active-filter", "opampActiveFilter", "learn.project.opampActiveFilter", 9,
            StandardLessons("learn.project.opampActiveFilter"), StandardQuiz("learn.project.opampActiveFilter"),
            [
                new("learn.project.opampActiveFilter.challenge.c1.label", "sim_ok", new { }),
                new("learn.project.opampActiveFilter.challenge.c2.label", "analysis_mode", new { mode = "ac" })
            ]),

        new("filters", "rc-low-pass", "rcLowPass", "learn.project.rcLowPass", 1,
            StandardLessons("learn.project.rcLowPass"), StandardQuiz("learn.project.rcLowPass"),
            [
                new("learn.project.rcLowPass.challenge.c1.label", "sim_ok", new { }),
                new("learn.project.rcLowPass.challenge.c2.label", "analysis_mode", new { mode = "ac" })
            ]),
        new("filters", "ac-rc-lpf", "ac", "learn.project.acRcLpf", 2,
            StandardLessons("learn.project.acRcLpf"), StandardQuiz("learn.project.acRcLpf"),
            [
                new("learn.project.acRcLpf.challenge.c1.label", "sim_ok", new { }),
                new("learn.project.acRcLpf.challenge.c2.label", "analysis_mode", new { mode = "ac" })
            ]),
        new("filters", "rc-high-pass", "rcHighPass", "learn.project.rcHighPass", 3,
            StandardLessons("learn.project.rcHighPass"), StandardQuiz("learn.project.rcHighPass"),
            [
                new("learn.project.rcHighPass.challenge.c1.label", "sim_ok", new { }),
                new("learn.project.rcHighPass.challenge.c2.label", "analysis_mode", new { mode = "ac" })
            ]),
        new("filters", "rlc-series", "rlcSeries", "learn.project.rlcSeries", 4,
            StandardLessons("learn.project.rlcSeries"), StandardQuiz("learn.project.rlcSeries"),
            [
                new("learn.project.rlcSeries.challenge.c1.label", "sim_ok", new { }),
                new("learn.project.rlcSeries.challenge.c2.label", "analysis_mode", new { mode = "ac" })
            ]),
        new("filters", "band-pass", "bandPass", "learn.project.bandPass", 5,
            StandardLessons("learn.project.bandPass"), StandardQuiz("learn.project.bandPass"),
            [
                new("learn.project.bandPass.challenge.c1.label", "sim_ok", new { }),
                new("learn.project.bandPass.challenge.c2.label", "analysis_mode", new { mode = "ac" })
            ]),
        new("filters", "notch-filter", "notchFilter", "learn.project.notchFilter", 6,
            StandardLessons("learn.project.notchFilter"), StandardQuiz("learn.project.notchFilter"),
            [
                new("learn.project.notchFilter.challenge.c1.label", "sim_ok", new { }),
                new("learn.project.notchFilter.challenge.c2.label", "analysis_mode", new { mode = "ac" })
            ]),
        new("filters", "voltage-divider", "voltageDivider", "learn.project.voltageDivider", 7,
            StandardLessons("learn.project.voltageDivider"), StandardQuiz("learn.project.voltageDivider"),
            DcSimOk("learn.project.voltageDivider")),
        new("filters", "divider-design", "voltageDivider", "learn.project.dividerDesign", 8,
            StandardLessons("learn.project.dividerDesign"), StandardQuiz("learn.project.dividerDesign"),
            DcSimOk("learn.project.dividerDesign")),
        new("filters", "pot-divider", "pot", "learn.project.potDivider", 9,
            StandardLessons("learn.project.potDivider"), StandardQuiz("learn.project.potDivider"),
            DcSimOk("learn.project.potDivider")),
        new("filters", "measure-freq-amp", "measureAc", "learn.project.measureAc", 10,
            StandardLessons("learn.project.measureAc"), StandardQuiz("learn.project.measureAc"),
            [
                new("learn.project.measureAc.challenge.c1.label", "sim_ok", new { }),
                new("learn.project.measureAc.challenge.c2.label", "analysis_mode", new { mode = "ac" })
            ]),
        new("filters", "bode-intuition", "measureAc", "learn.project.bodeIntuition", 11,
            StandardLessons("learn.project.bodeIntuition"), StandardQuiz("learn.project.bodeIntuition"),
            [
                new("learn.project.bodeIntuition.challenge.c1.label", "sim_ok", new { }),
                new("learn.project.bodeIntuition.challenge.c2.label", "analysis_mode", new { mode = "ac" })
            ]),

        new("motors", "motor-mosfet", "motor", "learn.project.motorMosfet", 1,
            StandardLessons("learn.project.motorMosfet"), StandardQuiz("learn.project.motorMosfet"),
            DcSimOk("learn.project.motorMosfet")),
        new("motors", "motor-pwm", "motorPwm", "learn.project.motorPwm", 2,
            StandardLessons("learn.project.motorPwm"), StandardQuiz("learn.project.motorPwm"),
            TranLab("learn.project.motorPwm")),
        new("motors", "motor-speed", "motorPwm", "learn.project.motorSpeed", 3,
            StandardLessons("learn.project.motorSpeed"), StandardQuiz("learn.project.motorSpeed"),
            TranLab("learn.project.motorSpeed")),
        new("motors", "motor-flyback", "motor", "learn.project.motorFlyback", 4,
            StandardLessons("learn.project.motorFlyback"), StandardQuiz("learn.project.motorFlyback"),
            DcSimOk("learn.project.motorFlyback")),
        new("motors", "h-bridge", "hBridge", "learn.project.hBridge", 5,
            StandardLessons("learn.project.hBridge"), StandardQuiz("learn.project.hBridge"),
            DcSimOk("learn.project.hBridge")),
        new("motors", "motor-direction", "motorDirection", "learn.project.motorDirection", 6,
            StandardLessons("learn.project.motorDirection"), StandardQuiz("learn.project.motorDirection"),
            DcSimOk("learn.project.motorDirection")),

        new("digital", "pull-up-down", "pullUpDown", "learn.project.pullUpDown", 1,
            StandardLessons("learn.project.pullUpDown"), StandardQuiz("learn.project.pullUpDown"),
            DcSimOk("learn.project.pullUpDown")),
        new("digital", "debounce", "debounce", "learn.project.debounce", 2,
            StandardLessons("learn.project.debounce"), StandardQuiz("learn.project.debounce"),
            DcSimOk("learn.project.debounce")),
        new("digital", "debounce-idea", "debounce", "learn.project.debounceIdea", 3,
            StandardLessons("learn.project.debounceIdea"), StandardQuiz("learn.project.debounceIdea"),
            DcSimOk("learn.project.debounceIdea")),

        new("sensors", "sensor-ldr", "ldr", "learn.project.sensorLdr", 1,
            StandardLessons("learn.project.sensorLdr"), StandardQuiz("learn.project.sensorLdr"),
            DcSimOk("learn.project.sensorLdr")),
        new("sensors", "sensor-pot", "pot", "learn.project.sensorPot", 2,
            StandardLessons("learn.project.sensorPot"), StandardQuiz("learn.project.sensorPot"),
            DcSimOk("learn.project.sensorPot")),
        new("sensors", "sensor-ntc", "ntcDivider", "learn.project.ntcDivider", 3,
            StandardLessons("learn.project.ntcDivider"), StandardQuiz("learn.project.ntcDivider"),
            DcSimOk("learn.project.ntcDivider")),
        new("sensors", "sensor-threshold", "opampComparator", "learn.project.sensorThreshold", 4,
            StandardLessons("learn.project.sensorThreshold"), StandardQuiz("learn.project.sensorThreshold"),
            DcSimOk("learn.project.sensorThreshold")),

        new("comms", "i2c-wiring", "i2cOled", "learn.project.commsI2c", 1,
            StandardLessons("learn.project.commsI2c"), StandardQuiz("learn.project.commsI2c"),
            DcSimOk("learn.project.commsI2c")),

        new("adc-dac", "adc-front-end", "pot", "learn.project.adcFrontEnd", 1,
            StandardLessons("learn.project.adcFrontEnd"), StandardQuiz("learn.project.adcFrontEnd"),
            DcSimOk("learn.project.adcFrontEnd")),
        new("adc-dac", "adc-reference", "voltageDivider", "learn.project.adcReference", 2,
            StandardLessons("learn.project.adcReference"), StandardQuiz("learn.project.adcReference"),
            DcSimOk("learn.project.adcReference")),
        new("adc-dac", "pwm-pseudo-dac", "pwmFilter", "learn.project.pwmFilter", 3,
            StandardLessons("learn.project.pwmFilter"), StandardQuiz("learn.project.pwmFilter"),
            TranLab("learn.project.pwmFilter")),

        new("industrial", "relay-transistor", "relayBjt", "learn.project.relayBjt", 1,
            StandardLessons("learn.project.relayBjt"), StandardQuiz("learn.project.relayBjt"),
            DcSimOk("learn.project.relayBjt")),
        new("industrial", "mosfet-driver", "nmos", "learn.project.mosfetDriver", 2,
            StandardLessons("learn.project.mosfetDriver"), StandardQuiz("learn.project.mosfetDriver"),
            SwitchLab("learn.project.mosfetDriver", "S1")),
        new("industrial", "coil-protection", "relay", "learn.project.coilProtect", 3,
            StandardLessons("learn.project.coilProtect"), StandardQuiz("learn.project.coilProtect"),
            DcSimOk("learn.project.coilProtect")),
        new("industrial", "inductive-load", "motor", "learn.project.inductiveLoad", 4,
            StandardLessons("learn.project.inductiveLoad"), StandardQuiz("learn.project.inductiveLoad"),
            DcSimOk("learn.project.inductiveLoad")),
        new("industrial", "estop-principle", "estopRelay", "learn.project.estopRelay", 5,
            StandardLessons("learn.project.estopRelay"), StandardQuiz("learn.project.estopRelay"),
            DcSimOk("learn.project.estopRelay")),
        new("industrial", "control-24v", "industrial24v", "learn.project.industrial24v", 6,
            StandardLessons("learn.project.industrial24v"), StandardQuiz("learn.project.industrial24v"),
            DcSimOk("learn.project.industrial24v")),

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
        new("switching", "bjt-vs-mos-compare", "nmos", "learn.project.bjtVsMos", 5,
            StandardLessons("learn.project.bjtVsMos"), StandardQuiz("learn.project.bjtVsMos"),
            SwitchLab("learn.project.bjtVsMos", "S1")),
        new("switching", "inductive-why-diode", "relay", "learn.project.inductiveWhyDiode", 6,
            StandardLessons("learn.project.inductiveWhyDiode"), StandardQuiz("learn.project.inductiveWhyDiode"),
            SwitchLab("learn.project.inductiveWhyDiode", "S1")),
        new("timing", "ne555-astable", "ne555", "learn.project.ne555", 1,
            StandardLessons("learn.project.ne555"), StandardQuiz("learn.project.ne555"), TranLab("learn.project.ne555")),
        new("timing", "ne555-play", "christmasTree", "learn.project.ne555Play", 2,
            StandardLessons("learn.project.ne555Play"), StandardQuiz("learn.project.ne555Play"),
            TranLab("learn.project.ne555Play")),
        new("timing", "ne555-pot-blink", "ne555Pot", "learn.project.ne555Pot", 3,
            StandardLessons("learn.project.ne555Pot"), StandardQuiz("learn.project.ne555Pot"),
            TranLab("learn.project.ne555Pot")),
        new("input", "pushbutton-led", "pushbutton", "learn.project.pushbutton", 1,
            StandardLessons("learn.project.pushbutton"), StandardQuiz("learn.project.pushbutton"),
            [new("learn.project.pushbutton.challenge.c1.label", "sim_ok", new { }),
             new("learn.project.pushbutton.challenge.c2.label", "branch_current_min", new { refId = "D1", minAmps = 0.001 })]),
        new("input", "ldr-nightlight", "ldr", "learn.project.ldr", 2,
            StandardLessons("learn.project.ldr"), StandardQuiz("learn.project.ldr"), LedLab("learn.project.ldr")),
        new("actuators", "buzzer-button", "buzzer", "learn.project.buzzer", 1,
            StandardLessons("learn.project.buzzer"), StandardQuiz("learn.project.buzzer"),
            SwitchLab("learn.project.buzzer", "S1")),
        new("actuators", "motor-control", "motor", "learn.project.motorControl", 2,
            StandardLessons("learn.project.motorControl"), StandardQuiz("learn.project.motorControl"),
            SwitchLab("learn.project.motorControl", "S1")),
        new("mcu", "arduino-dio-led", "arduino", "learn.project.arduino", 1,
            StandardLessons("learn.project.arduino"), StandardQuiz("learn.project.arduino"), LedLab("learn.project.arduino")),
        new("mcu", "pin-input-pulldown", "arduino", "learn.project.pinInput", 2,
            StandardLessons("learn.project.pinInput"), StandardQuiz("learn.project.pinInput"),
            LedLab("learn.project.pinInput")),
        new("buses", "i2c-oled-wiring", "i2cOled", "learn.project.i2cOled", 1,
            StandardLessons("learn.project.i2cOled"), StandardQuiz("learn.project.i2cOled"),
            [new("learn.project.i2cOled.challenge.c1.label", "sim_ok", new { }),
             new("learn.project.i2cOled.challenge.c2.label", "no_circuit_errors", new { })]),
        new("buses", "i2c-address-idea", "i2cOled", "learn.project.i2cAddress", 2,
            StandardLessons("learn.project.i2cAddress"), StandardQuiz("learn.project.i2cAddress"),
            DcSimOk("learn.project.i2cAddress")),
        new("buses", "spi-vs-i2c", "i2cOled", "learn.project.spiVsI2c", 3,
            StandardLessons("learn.project.spiVsI2c"), StandardQuiz("learn.project.spiVsI2c"),
            DcSimOk("learn.project.spiVsI2c")),
        new("buses", "i2c-multi-slave", "i2cOled", "learn.project.i2cMultiSlave", 4,
            StandardLessons("learn.project.i2cMultiSlave"), StandardQuiz("learn.project.i2cMultiSlave"),
            DcSimOk("learn.project.i2cMultiSlave"))
    ];
}

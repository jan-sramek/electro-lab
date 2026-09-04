using ElectroLab.LearningApi.Seed;
using Microsoft.EntityFrameworkCore;

namespace ElectroLab.LearningApi.Tests;

public class LearnCatalogSeederTests : IDisposable
{
    private readonly SqliteLearningDb _fixture = new();

    public void Dispose() => _fixture.Dispose();

    [Fact]
    public async Task Seeding_twice_is_idempotent()
    {
        await using (var db = _fixture.CreateContext()) await LearnCatalogSeeder.SeedAsync(db);
        var before = await SnapshotAsync();
        await using (var db = _fixture.CreateContext()) await LearnCatalogSeeder.SeedAsync(db);
        var after = await SnapshotAsync();

        Assert.NotEqual(0, before.Units);
        Assert.Equal(before, after);
    }

    [Fact]
    public async Task Reseed_restores_drifted_lessons_and_quiz_questions_for_existing_units_keeping_ids()
    {
        await using (var db = _fixture.CreateContext()) await LearnCatalogSeeder.SeedAsync(db);

        int unitId, keptLessonId, keptQuestionId, removedLessonId;
        string lessonBody, questionPrompt, correctId;
        await using (var db = _fixture.CreateContext())
        {
            var unit = await db.LearnUnits.Include(u => u.LessonBlocks).Include(u => u.QuizQuestions)
                .OrderBy(u => u.Id).FirstAsync();
            unitId = unit.Id;
            var lessons = unit.LessonBlocks.OrderBy(b => b.SortOrder).ToList();
            var questions = unit.QuizQuestions.OrderBy(q => q.SortOrder).ToList();
            Assert.True(lessons.Count >= 2);
            Assert.True(questions.Count >= 2);

            keptLessonId = lessons[0].Id;
            lessonBody = lessons[0].BodyKey;
            lessons[0].BodyKey = "drifted.body";
            removedLessonId = lessons[1].Id;
            db.LearnLessonBlocks.Remove(lessons[1]);

            keptQuestionId = questions[0].Id;
            questionPrompt = questions[0].PromptKey;
            correctId = questions[0].CorrectOptionId;
            questions[0].PromptKey = "drifted.prompt";
            questions[0].CorrectOptionId = "zz";
            db.LearnQuizQuestions.Remove(questions[^1]);
            db.LearnQuizQuestions.Add(new Data.Entities.LearnQuizQuestion
            {
                UnitId = unitId, SortOrder = 99, PromptKey = "stray", OptionsJson = "[]", CorrectOptionId = "a", ExplanationKey = "x"
            });
            await db.SaveChangesAsync();
        }

        await using (var db = _fixture.CreateContext()) await LearnCatalogSeeder.SeedAsync(db);

        await using (var db = _fixture.CreateContext())
        {
            var lessons = await db.LearnLessonBlocks.Where(b => b.UnitId == unitId).OrderBy(b => b.SortOrder).ToListAsync();
            Assert.Equal(2, lessons.Count);
            Assert.Equal(keptLessonId, lessons[0].Id);
            Assert.Equal(lessonBody, lessons[0].BodyKey);
            Assert.NotEqual(removedLessonId, lessons[1].Id);
            Assert.Equal([1, 2], lessons.Select(b => b.SortOrder));

            var questions = await db.LearnQuizQuestions.Where(q => q.UnitId == unitId).OrderBy(q => q.SortOrder).ToListAsync();
            Assert.Equal(3, questions.Count);
            Assert.Equal(keptQuestionId, questions[0].Id);
            Assert.Equal(questionPrompt, questions[0].PromptKey);
            Assert.Equal(correctId, questions[0].CorrectOptionId);
            Assert.DoesNotContain(questions, q => q.PromptKey == "stray");
            Assert.Equal([1, 2, 3], questions.Select(q => q.SortOrder));
        }
    }

    [Fact]
    public async Task Units_are_chained_by_next_unit_in_catalog_order()
    {
        await using (var db = _fixture.CreateContext()) await LearnCatalogSeeder.SeedAsync(db);
        await using var check = _fixture.CreateContext();
        var units = await check.LearnUnits.Include(u => u.Module)
            .OrderBy(u => u.Module.SortOrder).ThenBy(u => u.SortOrder).ToListAsync();

        for (var i = 0; i < units.Count - 1; i++)
            Assert.Equal(units[i + 1].Id, units[i].NextUnitId);
        Assert.Null(units[^1].NextUnitId);
    }

    private async Task<(int Modules, int Units, int Lessons, int Questions, int Criteria, string LessonIds, string QuestionIds)> SnapshotAsync()
    {
        await using var db = _fixture.CreateContext();
        return (
            await db.LearnModules.CountAsync(),
            await db.LearnUnits.CountAsync(),
            await db.LearnLessonBlocks.CountAsync(),
            await db.LearnQuizQuestions.CountAsync(),
            await db.LearnLabCriteria.CountAsync(),
            string.Join(",", await db.LearnLessonBlocks.OrderBy(b => b.Id).Select(b => b.Id).ToListAsync()),
            string.Join(",", await db.LearnQuizQuestions.OrderBy(q => q.Id).Select(q => q.Id).ToListAsync()));
    }
}

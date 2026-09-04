using ElectroLab.LearningApi.Contracts;
using ElectroLab.LearningApi.Data;
using ElectroLab.LearningApi.Data.Entities;
using ElectroLab.LearningApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ElectroLab.LearningApi.Tests;

public class LearnProgressServiceTests : IDisposable
{
    private readonly SqliteLearningDb _fixture = new();
    private readonly Guid _session = Guid.NewGuid();

    public void Dispose() => _fixture.Dispose();

    [Fact]
    public async Task Null_bodies_are_rejected_as_invalid_request_without_touching_the_db()
    {
        await _fixture.SeedTwoUnitModuleAsync();
        await using var db = _fixture.CreateContext();
        var svc = _fixture.CreateProgressService(db);

        var quiz = await svc.SubmitQuizAsync(_session, "m", "u1", null);
        var quizNullAnswers = await svc.SubmitQuizAsync(_session, "m", "u1", new QuizSubmitRequest(null!));
        var lab = await svc.VerifyLabAsync(_session, "m", "u1", null);
        var labNullResults = await svc.VerifyLabAsync(_session, "m", "u1", new LabVerifyRequest(null!));

        foreach (var rejection in new[] { quiz.Rejection, quizNullAnswers.Rejection, lab.Rejection, labNullResults.Rejection })
        {
            Assert.NotNull(rejection);
            Assert.Equal(LearnRejectionKind.InvalidRequest, rejection.Kind);
            Assert.Equal(LearnRejectionReasons.MissingBody, rejection.Reason);
        }

        Assert.Empty(await db.LearnProgress.ToListAsync());
    }

    [Fact]
    public async Task Unknown_unit_is_not_found()
    {
        await _fixture.SeedTwoUnitModuleAsync();
        await using var db = _fixture.CreateContext();
        var svc = _fixture.CreateProgressService(db);

        Assert.True((await svc.MarkReadAsync(_session, "m", "nope", true)).IsNotFound);
        Assert.True((await svc.SubmitQuizAsync(_session, "m", "nope", new QuizSubmitRequest(new Dictionary<int, string>()))).IsNotFound);
        Assert.True((await svc.VerifyLabAsync(_session, "m", "nope", new LabVerifyRequest([]))).IsNotFound);
    }

    [Fact]
    public async Task Quiz_rejects_unknown_question_ids()
    {
        var (u1, _) = await _fixture.SeedTwoUnitModuleAsync();
        await using var db = _fixture.CreateContext();
        var svc = _fixture.CreateProgressService(db);

        var result = await svc.SubmitQuizAsync(_session, "m", "u1", new QuizSubmitRequest(new Dictionary<int, string> { [9999] = "a" }));

        Assert.Equal(LearnRejectionReasons.UnknownQuestion, result.Rejection!.Reason);
        Assert.Null(await _fixture.GetRowAsync(_session, u1.Id));
    }

    [Fact]
    public async Task Quiz_pass_persists_and_partial_answers_fail_without_clearing_an_earlier_pass()
    {
        var (u1, _) = await _fixture.SeedTwoUnitModuleAsync();
        await using var db = _fixture.CreateContext();
        var svc = _fixture.CreateProgressService(db);
        var qs = u1.QuizQuestions.OrderBy(q => q.SortOrder).ToList();

        var pass = await svc.SubmitQuizAsync(_session, "m", "u1",
            new QuizSubmitRequest(new Dictionary<int, string> { [qs[0].Id] = "a", [qs[1].Id] = "b" }));
        Assert.True(pass.Value!.Passed);
        Assert.Equal(2, pass.Value.CorrectCount);
        Assert.True((await _fixture.GetRowAsync(_session, u1.Id))!.QuizPassed);

        var fail = await svc.SubmitQuizAsync(_session, "m", "u1",
            new QuizSubmitRequest(new Dictionary<int, string> { [qs[0].Id] = "b" }));
        Assert.False(fail.Value!.Passed);
        Assert.Equal(0, fail.Value.CorrectCount);
        Assert.Equal(2, fail.Value.TotalCount);
        Assert.True((await _fixture.GetRowAsync(_session, u1.Id))!.QuizPassed, "a later failed attempt must not revoke the pass");
    }

    [Fact]
    public async Task Empty_quiz_and_empty_lab_persist_their_pass_so_the_unit_can_complete()
    {
        var (u1, u2) = await _fixture.SeedTwoUnitModuleAsync();
        await _fixture.SetRowAsync(_session, u1.Id, read: true, quiz: true, lab: true); // unlock u2
        await using var db = _fixture.CreateContext();
        var svc = _fixture.CreateProgressService(db);

        var read = await svc.MarkReadAsync(_session, "m", "u2", true);
        Assert.True(read.Value!.ReadComplete);

        var quiz = await svc.SubmitQuizAsync(_session, "m", "u2", new QuizSubmitRequest(new Dictionary<int, string>()));
        Assert.True(quiz.Value!.Passed);
        Assert.Equal(0, quiz.Value.TotalCount);
        Assert.True((await _fixture.GetRowAsync(_session, u2.Id))!.QuizPassed);

        var lab = await svc.VerifyLabAsync(_session, "m", "u2", new LabVerifyRequest([]));
        Assert.True(lab.Value!.Passed);
        Assert.True(lab.Value.Progress.Complete);

        var row = await _fixture.GetRowAsync(_session, u2.Id);
        Assert.True(row!.IsComplete);
    }

    [Fact]
    public async Task Lab_verify_requires_read_and_quiz_on_the_same_row()
    {
        var (u1, _) = await _fixture.SeedTwoUnitModuleAsync();
        await using var db = _fixture.CreateContext();
        var svc = _fixture.CreateProgressService(db);
        var allPassed = new LabVerifyRequest(u1.LabCriteria.Select(c => new LabCriterionResultDto(c.Id, true)).ToList());

        var noRow = await svc.VerifyLabAsync(_session, "m", "u1", allPassed);
        Assert.Equal(LearnRejectionKind.Conflict, noRow.Rejection!.Kind);
        Assert.Equal(LearnRejectionReasons.QuizRequired, noRow.Rejection.Reason);

        await _fixture.SetRowAsync(_session, u1.Id, read: false, quiz: true, lab: false);
        var noRead = await svc.VerifyLabAsync(_session, "m", "u1", allPassed);
        Assert.Equal(LearnRejectionReasons.QuizRequired, noRead.Rejection!.Reason);

        await _fixture.SetRowAsync(_session, u1.Id, read: true, quiz: false, lab: false);
        var noQuiz = await svc.VerifyLabAsync(_session, "m", "u1", allPassed);
        Assert.Equal(LearnRejectionReasons.QuizRequired, noQuiz.Rejection!.Reason);
        Assert.False((await _fixture.GetRowAsync(_session, u1.Id))!.LabPassed);

        await _fixture.SetRowAsync(_session, u1.Id, read: true, quiz: true, lab: false);
        var ok = await svc.VerifyLabAsync(_session, "m", "u1", allPassed);
        Assert.True(ok.Value!.Passed);
        Assert.True(ok.Value.Progress.Complete);
        Assert.True((await _fixture.GetRowAsync(_session, u1.Id))!.LabPassed);
    }

    [Fact]
    public async Task Lab_verify_rejects_duplicate_and_unknown_criteria_and_requires_full_coverage()
    {
        var (u1, _) = await _fixture.SeedTwoUnitModuleAsync();
        await _fixture.SetRowAsync(_session, u1.Id, read: true, quiz: true, lab: false);
        await using var db = _fixture.CreateContext();
        var svc = _fixture.CreateProgressService(db);
        var ids = u1.LabCriteria.OrderBy(c => c.SortOrder).Select(c => c.Id).ToList();

        // Duplicate: the same id twice must not count as covering two criteria.
        var dup = await svc.VerifyLabAsync(_session, "m", "u1", new LabVerifyRequest([new(ids[0], true), new(ids[0], true)]));
        Assert.Equal(LearnRejectionReasons.DuplicateCriterion, dup.Rejection!.Reason);

        var unknown = await svc.VerifyLabAsync(_session, "m", "u1", new LabVerifyRequest([new(ids[0], true), new(424242, true)]));
        Assert.Equal(LearnRejectionReasons.UnknownCriterion, unknown.Rejection!.Reason);

        var partial = await svc.VerifyLabAsync(_session, "m", "u1", new LabVerifyRequest([new(ids[0], true)]));
        Assert.False(partial.Value!.Passed);

        var oneFailed = await svc.VerifyLabAsync(_session, "m", "u1", new LabVerifyRequest([new(ids[0], true), new(ids[1], false)]));
        Assert.False(oneFailed.Value!.Passed);
        Assert.False((await _fixture.GetRowAsync(_session, u1.Id))!.LabPassed);

        var full = await svc.VerifyLabAsync(_session, "m", "u1", new LabVerifyRequest([new(ids[1], true), new(ids[0], true)]));
        Assert.True(full.Value!.Passed);
    }

    [Fact]
    public async Task Locked_unit_rejects_progress_writes_until_predecessor_is_complete()
    {
        var (u1, u2) = await _fixture.SeedTwoUnitModuleAsync();
        await using var db = _fixture.CreateContext();
        var svc = _fixture.CreateProgressService(db);
        var empty = new QuizSubmitRequest(new Dictionary<int, string>());

        var read = await svc.MarkReadAsync(_session, "m", "u2", true);
        Assert.Equal(LearnRejectionReasons.UnitLocked, read.Rejection!.Reason);
        Assert.Equal(LearnRejectionKind.Conflict, read.Rejection.Kind);

        var quiz = await svc.SubmitQuizAsync(_session, "m", "u2", empty);
        Assert.Equal(LearnRejectionReasons.UnitLocked, quiz.Rejection!.Reason);

        var lab = await svc.VerifyLabAsync(_session, "m", "u2", new LabVerifyRequest([]));
        Assert.Equal(LearnRejectionReasons.UnitLocked, lab.Rejection!.Reason);
        Assert.Null(await _fixture.GetRowAsync(_session, u2.Id));

        // Another session's completion of u1 must not unlock u2 for this session.
        await _fixture.SetRowAsync(Guid.NewGuid(), u1.Id, read: true, quiz: true, lab: true);
        Assert.Equal(LearnRejectionReasons.UnitLocked, (await svc.SubmitQuizAsync(_session, "m", "u2", empty)).Rejection!.Reason);

        await _fixture.SetRowAsync(_session, u1.Id, read: true, quiz: true, lab: true);
        var unlocked = await svc.SubmitQuizAsync(_session, "m", "u2", empty);
        Assert.True(unlocked.IsSuccess);
        Assert.True(unlocked.Value!.Passed);
    }

    [Fact]
    public async Task First_unit_is_available_and_read_can_be_toggled_off_even_when_locked_rule_applies()
    {
        var (u1, _) = await _fixture.SeedTwoUnitModuleAsync();
        await using var db = _fixture.CreateContext();
        var svc = _fixture.CreateProgressService(db);

        var on = await svc.MarkReadAsync(_session, "m", "u1", true);
        Assert.True(on.Value!.ReadComplete);
        var off = await svc.MarkReadAsync(_session, "m", "u1", false);
        Assert.False(off.Value!.ReadComplete);
        Assert.False((await _fixture.GetRowAsync(_session, u1.Id))!.ReadComplete);
    }

    [Fact]
    public async Task Concurrent_first_write_for_the_same_key_merges_instead_of_failing_on_the_primary_key()
    {
        var (u1, _) = await _fixture.SeedTwoUnitModuleAsync();

        // Simulate a racing request: right before this context's INSERT hits the database, another
        // context inserts the same (session, unit) row with ReadComplete = true.
        var racer = new RaceInterceptor(_fixture, _session, u1.Id);
        await using var db = _fixture.CreateContext(racer);
        var svc = _fixture.CreateProgressService(db);
        var qs = u1.QuizQuestions.OrderBy(q => q.SortOrder).ToList();

        var result = await svc.SubmitQuizAsync(_session, "m", "u1",
            new QuizSubmitRequest(new Dictionary<int, string> { [qs[0].Id] = "a", [qs[1].Id] = "b" }));

        Assert.True(racer.Fired, "the interceptor should have injected the competing insert");
        Assert.True(result.IsSuccess);
        Assert.True(result.Value!.Passed);

        var row = await _fixture.GetRowAsync(_session, u1.Id);
        Assert.NotNull(row);
        Assert.True(row.ReadComplete, "the winner's write must survive");
        Assert.True(row.QuizPassed, "the loser's change must be applied on top of the winner's row");

        await using var check = _fixture.CreateContext();
        Assert.Equal(1, await check.LearnProgress.CountAsync(p => p.SessionId == _session));
    }

    private sealed class RaceInterceptor(SqliteLearningDb fixture, Guid session, int unitId) : SaveChangesInterceptor
    {
        public bool Fired { get; private set; }

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            if (!Fired && eventData.Context is LearningDbContext ctx
                && ctx.ChangeTracker.Entries<LearnProgressRow>().Any(e => e.State == EntityState.Added))
            {
                Fired = true;
                await fixture.SetRowAsync(session, unitId, read: true, quiz: false, lab: false);
            }

            return result;
        }
    }
}

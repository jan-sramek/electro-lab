using ElectroLab.LearningApi.Contracts;
using ElectroLab.LearningApi.Services;

namespace ElectroLab.LearningApi.Endpoints;

public static class LearnEndpoints
{
    public const string SessionHeader = "X-Learn-Session";

    public static void MapLearnEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/learning");

        group.MapGet("/catalog", async (HttpContext ctx, LearnCatalogService catalog) =>
        {
            var sessionId = RequireSession(ctx);
            return Results.Ok(await catalog.GetCatalogAsync(sessionId, ctx.RequestAborted));
        });

        group.MapGet("/catalog/{moduleSlug}/{unitSlug}", async (
            string moduleSlug,
            string unitSlug,
            HttpContext ctx,
            LearnCatalogService catalog) =>
        {
            var sessionId = RequireSession(ctx);
            var detail = await catalog.GetUnitAsync(moduleSlug, unitSlug, sessionId, ctx.RequestAborted);
            return detail is null ? Results.NotFound() : Results.Ok(detail);
        });

        group.MapGet("/progress", async (HttpContext ctx, LearnProgressService progress) =>
        {
            var sessionId = RequireSession(ctx);
            return Results.Ok(await progress.GetSnapshotAsync(sessionId, ctx.RequestAborted));
        });

        group.MapPut("/progress/{moduleSlug}/{unitSlug}/read", async (
            string moduleSlug,
            string unitSlug,
            MarkReadRequest body,
            HttpContext ctx,
            LearnProgressService progress) =>
        {
            var sessionId = RequireSession(ctx);
            var dto = await progress.MarkReadAsync(
                sessionId, moduleSlug, unitSlug, body.Complete, ctx.RequestAborted);
            return dto is null ? Results.NotFound() : Results.Ok(dto);
        });

        group.MapPost("/quiz/{moduleSlug}/{unitSlug}/submit", async (
            string moduleSlug,
            string unitSlug,
            QuizSubmitRequest body,
            HttpContext ctx,
            LearnProgressService progress) =>
        {
            var sessionId = RequireSession(ctx);
            var result = await progress.SubmitQuizAsync(
                sessionId, moduleSlug, unitSlug, body, ctx.RequestAborted);
            return result is null ? Results.NotFound() : Results.Ok(result);
        });

        group.MapPost("/lab-challenge/{moduleSlug}/{unitSlug}/verify", async (
            string moduleSlug,
            string unitSlug,
            LabVerifyRequest body,
            HttpContext ctx,
            LearnProgressService progress) =>
        {
            var sessionId = RequireSession(ctx);
            var result = await progress.VerifyLabAsync(
                sessionId, moduleSlug, unitSlug, body, ctx.RequestAborted);
            return result is null ? Results.NotFound() : Results.Ok(result);
        });
    }

    private static Guid RequireSession(HttpContext ctx)
    {
        if (!ctx.Request.Headers.TryGetValue(SessionHeader, out var raw)
            || !Guid.TryParse(raw.ToString(), out var sessionId))
        {
            throw new BadHttpRequestException($"Missing or invalid {SessionHeader} header.");
        }

        return sessionId;
    }
}

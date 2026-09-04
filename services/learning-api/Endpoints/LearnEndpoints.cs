using ElectroLab.LearningApi.Contracts;
using ElectroLab.LearningApi.Services;

namespace ElectroLab.LearningApi.Endpoints;

public static class LearnEndpoints
{
    public const string SessionHeader = "X-Learn-Session";
    private const string SessionItemKey = "ElectroLab.LearnSessionId";

    public static void MapLearnEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/learning")
            .AddEndpointFilter(RequireSessionAsync);

        group.MapGet("/catalog", async (HttpContext ctx, LearnCatalogService catalog) =>
            Results.Ok(await catalog.GetCatalogAsync(GetSession(ctx), ctx.RequestAborted)));

        group.MapGet("/catalog/{moduleSlug}/{unitSlug}", async (
            string moduleSlug,
            string unitSlug,
            HttpContext ctx,
            LearnCatalogService catalog) =>
        {
            var detail = await catalog.GetUnitAsync(moduleSlug, unitSlug, GetSession(ctx), ctx.RequestAborted);
            return detail is null ? Results.NotFound() : Results.Ok(detail);
        });

        group.MapGet("/progress", async (HttpContext ctx, LearnProgressService progress) =>
            Results.Ok(await progress.GetSnapshotAsync(GetSession(ctx), ctx.RequestAborted)));

        group.MapPut("/progress/{moduleSlug}/{unitSlug}/read", async (
            string moduleSlug,
            string unitSlug,
            MarkReadRequest? body,
            HttpContext ctx,
            LearnProgressService progress) =>
        {
            if (body is null) return MissingBody();
            var result = await progress.MarkReadAsync(
                GetSession(ctx), moduleSlug, unitSlug, body.Complete, ctx.RequestAborted);
            return ToHttp(result);
        });

        group.MapPost("/quiz/{moduleSlug}/{unitSlug}/submit", async (
            string moduleSlug,
            string unitSlug,
            QuizSubmitRequest? body,
            HttpContext ctx,
            LearnProgressService progress) =>
        {
            if (LearnRequestValidation.ValidateQuiz(body) is { } invalid) return ToHttp(invalid);
            var result = await progress.SubmitQuizAsync(
                GetSession(ctx), moduleSlug, unitSlug, body, ctx.RequestAborted);
            return ToHttp(result);
        });

        group.MapPost("/lab-challenge/{moduleSlug}/{unitSlug}/verify", async (
            string moduleSlug,
            string unitSlug,
            LabVerifyRequest? body,
            HttpContext ctx,
            LearnProgressService progress) =>
        {
            if (LearnRequestValidation.ValidateLab(body) is { } invalid) return ToHttp(invalid);
            var result = await progress.VerifyLabAsync(
                GetSession(ctx), moduleSlug, unitSlug, body, ctx.RequestAborted);
            return ToHttp(result);
        });
    }

    /// <summary>Endpoint filter: a well-formed session GUID header is required on every learn route (400 otherwise).</summary>
    private static async ValueTask<object?> RequireSessionAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var ctx = context.HttpContext;
        if (!ctx.Request.Headers.TryGetValue(SessionHeader, out var raw)
            || raw.Count != 1
            || !Guid.TryParseExact(raw.ToString().Trim(), "D", out var sessionId)
            || sessionId == Guid.Empty)
        {
            return Results.Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Missing or invalid session header.",
                detail: $"The {SessionHeader} header must contain a single GUID.");
        }

        ctx.Items[SessionItemKey] = sessionId;
        return await next(context);
    }

    private static Guid GetSession(HttpContext ctx) => (Guid)ctx.Items[SessionItemKey]!;

    private static IResult MissingBody() => ToHttp(
        LearnRejection.Invalid(LearnRejectionReasons.MissingBody, "A JSON request body is required."));

    private static IResult ToHttp<T>(LearnResult<T> result) where T : class
    {
        if (result.IsNotFound) return Results.NotFound();
        if (result.Rejection is { } rejection) return ToHttp(rejection);
        return Results.Ok(result.Value);
    }

    private static IResult ToHttp(LearnRejection rejection) => Results.Problem(
        statusCode: rejection.Kind == LearnRejectionKind.Conflict
            ? StatusCodes.Status409Conflict
            : StatusCodes.Status400BadRequest,
        title: rejection.Kind == LearnRejectionKind.Conflict ? "Request conflicts with current progress." : "Invalid request.",
        detail: rejection.Detail,
        extensions: new Dictionary<string, object?> { ["reason"] = rejection.Reason });
}

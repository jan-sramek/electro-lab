using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using ElectroLab.LearningApi.Data;
using ElectroLab.LearningApi.Endpoints;
using ElectroLab.LearningApi.Seed;
using ElectroLab.LearningApi.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("LearningDb")
    ?? "Host=localhost;Port=5433;Database=electro_lab;Username=electro;Password=electro";

builder.Services.AddDbContext<LearningDbContext>(o => o.UseNpgsql(connectionString));
builder.Services.AddScoped<LearnCatalogService>();
builder.Services.AddScoped<LearnProgressService>();
builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    o.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase));
});
builder.Services.AddCors(o =>
{
    o.AddDefaultPolicy(p => p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

var app = builder.Build();

// Unhandled exceptions become RFC 7807 500 responses (no stack trace) in every environment;
// malformed request bodies keep their 400 (Development sets ThrowOnBadRequest, so they surface
// here as BadHttpRequestException); non-success status codes without a body get a ProblemDetails body.
app.UseExceptionHandler(new ExceptionHandlerOptions
{
    StatusCodeSelector = ex => ex is BadHttpRequestException bad ? bad.StatusCode : StatusCodes.Status500InternalServerError
});
app.UseStatusCodePages();
app.UseCors();

await StartupSeeder.MigrateAndSeedAsync(app.Services, connectionString, app.Lifetime.ApplicationStopping);

app.MapGet("/api/learning/health", () => Results.Ok(new { status = "ok", service = "learning-api" }));

app.MapGet("/api/learning/i18n/{locale}", async (string locale, LearningDbContext db) =>
{
    if (!I18nLocale.TryNormalize(locale, out var normalized))
    {
        return Results.Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: "Invalid locale.",
            detail: $"Locale must be 1-{I18nLocale.MaxLength} characters of letters, digits, '-' or '_'.");
    }

    var rows = await db.Translations
        .AsNoTracking()
        .Where(t => t.Locale == normalized)
        .OrderBy(t => t.Key)
        .ToListAsync();

    if (rows.Count == 0 && normalized != "en")
    {
        rows = await db.Translations
            .AsNoTracking()
            .Where(t => t.Locale == "en")
            .OrderBy(t => t.Key)
            .ToListAsync();
        normalized = "en";
    }

    return Results.Ok(new I18nResponse
    {
        Locale = normalized,
        Messages = rows.ToDictionary(r => r.Key, r => r.Value)
    });
});

app.MapLearnEndpoints();

app.Run();

internal sealed class I18nResponse
{
    public required string Locale { get; init; }
    public required Dictionary<string, string> Messages { get; init; }
}

internal static partial class I18nLocale
{
    /// <summary>Matches the <c>translations.Locale</c> column length.</summary>
    public const int MaxLength = 16;

    [GeneratedRegex("^[A-Za-z0-9_-]+$")]
    private static partial Regex Allowed();

    public static bool TryNormalize(string? raw, out string normalized)
    {
        normalized = "en";
        if (string.IsNullOrWhiteSpace(raw)) return true;

        var trimmed = raw.Trim();
        if (trimmed.Length > MaxLength || !Allowed().IsMatch(trimmed)) return false;

        normalized = trimmed.ToLowerInvariant();
        return true;
    }
}

public partial class Program;

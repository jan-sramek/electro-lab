using System.Text.Json.Serialization;
using ElectroLab.LearningApi.Data;
using ElectroLab.LearningApi.Seed;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("LearningDb")
    ?? "Host=localhost;Port=5433;Database=electro_lab;Username=electro;Password=electro";

builder.Services.AddDbContext<LearningDbContext>(o => o.UseNpgsql(connectionString));
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});
builder.Services.AddCors(o =>
{
    o.AddDefaultPolicy(p => p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

var app = builder.Build();
app.UseCors();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LearningDbContext>();
    await db.Database.EnsureCreatedAsync();
    await TranslationSeeder.SeedEnglishAsync(db);
}

app.MapGet("/api/learning/health", () => Results.Ok(new { status = "ok", service = "learning-api" }));

app.MapGet("/api/learning/i18n/{locale}", async (string locale, LearningDbContext db) =>
{
    var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale.Trim().ToLowerInvariant();
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

app.Run();

internal sealed class I18nResponse
{
    public required string Locale { get; init; }
    public required Dictionary<string, string> Messages { get; init; }
}

public partial class Program;

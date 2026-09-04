using ElectroLab.LearningApi.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace ElectroLab.LearningApi.Seed;

/// <summary>
/// Runs migrations and catalog seeding under a Postgres session-level advisory lock so that
/// concurrently starting replicas serialize instead of racing on inserts. The lock is held on a
/// dedicated connection for the whole migrate+seed window and released explicitly (and implicitly
/// if the connection drops).
/// </summary>
public static class StartupSeeder
{
    /// <summary>Arbitrary constant shared by every replica of this service; must not collide with other apps' locks.</summary>
    public const long AdvisoryLockKey = 0x454C4C4541524E01; // "ELLEARN" + 01

    public static async Task MigrateAndSeedAsync(IServiceProvider services, string connectionString, CancellationToken ct = default)
    {
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(StartupSeeder));

        await using var lockConnection = await OpenLockConnectionAsync(connectionString, logger, ct);
        if (lockConnection is not null)
        {
            logger.LogInformation("Acquiring startup advisory lock {Key}...", AdvisoryLockKey);
            await using var cmd = new NpgsqlCommand("SELECT pg_advisory_lock(@key)", lockConnection);
            cmd.Parameters.AddWithValue("key", AdvisoryLockKey);
            await cmd.ExecuteNonQueryAsync(ct);
            logger.LogInformation("Startup advisory lock acquired.");
        }

        try
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<LearningDbContext>();
            await MigrateAsync(db, logger, ct);
            await TranslationSeeder.SeedEnglishAsync(db, ct);
            await LearnCatalogSeeder.SeedAsync(db);
        }
        finally
        {
            if (lockConnection is not null)
            {
                try
                {
                    await using var unlock = new NpgsqlCommand("SELECT pg_advisory_unlock(@key)", lockConnection);
                    unlock.Parameters.AddWithValue("key", AdvisoryLockKey);
                    await unlock.ExecuteNonQueryAsync(CancellationToken.None);
                }
                catch (Exception ex)
                {
                    // Closing the connection releases the session lock anyway.
                    logger.LogWarning(ex, "Failed to release startup advisory lock explicitly; relying on connection close.");
                }
            }
        }
    }

    private static async Task MigrateAsync(LearningDbContext db, ILogger logger, CancellationToken ct)
    {
        try
        {
            await db.Database.MigrateAsync(ct);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.DuplicateDatabase)
        {
            // Two replicas both saw a missing database before the lock could be taken on it;
            // the other one created it, so migrating again is now safe.
            logger.LogWarning("Database was created concurrently by another replica; retrying migration.");
            await db.Database.MigrateAsync(ct);
        }
    }

    /// <summary>
    /// Opens the lock connection against the target database. If the database does not exist yet
    /// (first boot before migrations create it) fall back to the maintenance database so the lock
    /// can still be taken; if even that is unavailable, proceed unlocked with a warning.
    /// </summary>
    private static async Task<NpgsqlConnection?> OpenLockConnectionAsync(string connectionString, ILogger logger, CancellationToken ct)
    {
        try
        {
            var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync(ct);
            return conn;
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.InvalidCatalogName)
        {
            logger.LogInformation("Target database does not exist yet; taking startup lock on maintenance database.");
        }

        try
        {
            var builder = new NpgsqlConnectionStringBuilder(connectionString) { Database = "postgres" };
            var conn = new NpgsqlConnection(builder.ConnectionString);
            await conn.OpenAsync(ct);
            return conn;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogWarning(ex, "Could not open a connection for the startup advisory lock; migrating without replica serialization.");
            return null;
        }
    }
}

using Microsoft.EntityFrameworkCore;

namespace ElectroLab.LearningApi.Data;

public sealed class LearningDbContext(DbContextOptions<LearningDbContext> options) : DbContext(options)
{
    public DbSet<TranslationRow> Translations => Set<TranslationRow>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TranslationRow>(e =>
        {
            e.ToTable("translations");
            e.HasKey(x => new { x.Locale, x.Key });
            e.Property(x => x.Locale).HasMaxLength(16).IsRequired();
            e.Property(x => x.Key).HasMaxLength(200).IsRequired();
            e.Property(x => x.Value).IsRequired();
        });
    }
}

public sealed class TranslationRow
{
    public required string Locale { get; set; }
    public required string Key { get; set; }
    public required string Value { get; set; }
}

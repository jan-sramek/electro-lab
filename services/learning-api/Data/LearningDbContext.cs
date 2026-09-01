using ElectroLab.LearningApi.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElectroLab.LearningApi.Data;

public sealed class LearningDbContext(DbContextOptions<LearningDbContext> options) : DbContext(options)
{
    public DbSet<TranslationRow> Translations => Set<TranslationRow>();
    public DbSet<LearnModule> LearnModules => Set<LearnModule>();
    public DbSet<LearnUnit> LearnUnits => Set<LearnUnit>();
    public DbSet<LearnLessonBlock> LearnLessonBlocks => Set<LearnLessonBlock>();
    public DbSet<LearnQuizQuestion> LearnQuizQuestions => Set<LearnQuizQuestion>();
    public DbSet<LearnLabCriterion> LearnLabCriteria => Set<LearnLabCriterion>();
    public DbSet<LearnProgressRow> LearnProgress => Set<LearnProgressRow>();

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

        modelBuilder.Entity<LearnModule>(e =>
        {
            e.ToTable("learn_modules");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Slug).HasMaxLength(64).IsRequired();
            e.Property(x => x.TitleKey).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<LearnUnit>(e =>
        {
            e.ToTable("learn_units");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.ModuleId, x.Slug }).IsUnique();
            e.Property(x => x.Slug).HasMaxLength(64).IsRequired();
            e.Property(x => x.ExampleId).HasMaxLength(64).IsRequired();
            e.Property(x => x.I18nKeyPrefix).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Module).WithMany(m => m.Units).HasForeignKey(x => x.ModuleId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.NextUnit).WithMany().HasForeignKey(x => x.NextUnitId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<LearnLessonBlock>(e =>
        {
            e.ToTable("learn_lesson_blocks");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.UnitId, x.SortOrder }).IsUnique();
            e.Property(x => x.TitleKey).HasMaxLength(200);
            e.Property(x => x.BodyKey).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Unit).WithMany(u => u.LessonBlocks).HasForeignKey(x => x.UnitId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LearnQuizQuestion>(e =>
        {
            e.ToTable("learn_quiz_questions");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.UnitId, x.SortOrder }).IsUnique();
            e.Property(x => x.PromptKey).HasMaxLength(200).IsRequired();
            e.Property(x => x.OptionsJson).IsRequired();
            e.Property(x => x.CorrectOptionId).HasMaxLength(8).IsRequired();
            e.Property(x => x.ExplanationKey).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Unit).WithMany(u => u.QuizQuestions).HasForeignKey(x => x.UnitId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LearnLabCriterion>(e =>
        {
            e.ToTable("learn_lab_criteria");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.UnitId, x.SortOrder }).IsUnique();
            e.Property(x => x.LabelKey).HasMaxLength(200).IsRequired();
            e.Property(x => x.Type).HasMaxLength(64).IsRequired();
            e.Property(x => x.ParamsJson).IsRequired();
            e.HasOne(x => x.Unit).WithMany(u => u.LabCriteria).HasForeignKey(x => x.UnitId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LearnProgressRow>(e =>
        {
            e.ToTable("learn_progress");
            e.HasKey(x => new { x.SessionId, x.UnitId });
            e.HasOne(x => x.Unit).WithMany().HasForeignKey(x => x.UnitId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}

public sealed class TranslationRow
{
    public required string Locale { get; set; }
    public required string Key { get; set; }
    public required string Value { get; set; }
}

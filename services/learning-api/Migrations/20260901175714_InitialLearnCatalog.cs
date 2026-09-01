using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ElectroLab.LearningApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialLearnCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "learn_modules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Slug = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    TitleKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_learn_modules", x => x.Id);
                });

            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS translations (
                    "Locale" character varying(16) NOT NULL,
                    "Key" character varying(200) NOT NULL,
                    "Value" text NOT NULL,
                    CONSTRAINT "PK_translations" PRIMARY KEY ("Locale", "Key")
                );
                """);

            migrationBuilder.CreateTable(
                name: "learn_units",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ModuleId = table.Column<int>(type: "integer", nullable: false),
                    Slug = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ExampleId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    I18nKeyPrefix = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    NextUnitId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_learn_units", x => x.Id);
                    table.ForeignKey(
                        name: "FK_learn_units_learn_modules_ModuleId",
                        column: x => x.ModuleId,
                        principalTable: "learn_modules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_learn_units_learn_units_NextUnitId",
                        column: x => x.NextUnitId,
                        principalTable: "learn_units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "learn_lab_criteria",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UnitId = table.Column<int>(type: "integer", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    LabelKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ParamsJson = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_learn_lab_criteria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_learn_lab_criteria_learn_units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "learn_units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "learn_lesson_blocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UnitId = table.Column<int>(type: "integer", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    TitleKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BodyKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_learn_lesson_blocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_learn_lesson_blocks_learn_units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "learn_units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "learn_progress",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    UnitId = table.Column<int>(type: "integer", nullable: false),
                    ReadComplete = table.Column<bool>(type: "boolean", nullable: false),
                    QuizPassed = table.Column<bool>(type: "boolean", nullable: false),
                    LabPassed = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_learn_progress", x => new { x.SessionId, x.UnitId });
                    table.ForeignKey(
                        name: "FK_learn_progress_learn_units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "learn_units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "learn_quiz_questions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UnitId = table.Column<int>(type: "integer", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    PromptKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    OptionsJson = table.Column<string>(type: "text", nullable: false),
                    CorrectOptionId = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    ExplanationKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_learn_quiz_questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_learn_quiz_questions_learn_units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "learn_units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_learn_lab_criteria_UnitId_SortOrder",
                table: "learn_lab_criteria",
                columns: new[] { "UnitId", "SortOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_learn_lesson_blocks_UnitId_SortOrder",
                table: "learn_lesson_blocks",
                columns: new[] { "UnitId", "SortOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_learn_modules_Slug",
                table: "learn_modules",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_learn_progress_UnitId",
                table: "learn_progress",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_learn_quiz_questions_UnitId_SortOrder",
                table: "learn_quiz_questions",
                columns: new[] { "UnitId", "SortOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_learn_units_ModuleId_Slug",
                table: "learn_units",
                columns: new[] { "ModuleId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_learn_units_NextUnitId",
                table: "learn_units",
                column: "NextUnitId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "learn_lab_criteria");

            migrationBuilder.DropTable(
                name: "learn_lesson_blocks");

            migrationBuilder.DropTable(
                name: "learn_progress");

            migrationBuilder.DropTable(
                name: "learn_quiz_questions");

            migrationBuilder.DropTable(
                name: "translations");

            migrationBuilder.DropTable(
                name: "learn_units");

            migrationBuilder.DropTable(
                name: "learn_modules");
        }
    }
}

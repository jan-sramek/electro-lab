using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ElectroLab.LearningApi.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizCorrectCounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "QuizCorrectCount",
                table: "learn_progress",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "QuizTotalCount",
                table: "learn_progress",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuizCorrectCount",
                table: "learn_progress");

            migrationBuilder.DropColumn(
                name: "QuizTotalCount",
                table: "learn_progress");
        }
    }
}

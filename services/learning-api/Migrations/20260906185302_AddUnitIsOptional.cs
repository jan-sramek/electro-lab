using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ElectroLab.LearningApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUnitIsOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsOptional",
                table: "learn_units",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOptional",
                table: "learn_units");
        }
    }
}

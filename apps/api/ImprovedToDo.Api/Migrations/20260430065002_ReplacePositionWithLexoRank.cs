using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ImprovedToDo.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReplacePositionWithLexoRank : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Position",
                table: "TodoItems");

            migrationBuilder.AddColumn<string>(
                name: "LexoRank",
                table: "TodoItems",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LexoRank",
                table: "TodoItems");

            migrationBuilder.AddColumn<int>(
                name: "Position",
                table: "TodoItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ImprovedToDo.Api.Migrations
{
    /// <inheritdoc />
    public partial class ChangeOrderToPosition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Order",
                table: "TodoItems",
                newName: "Position");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Position",
                table: "TodoItems",
                newName: "Order");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace B1ngo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddXminConcurrencyTokenAndMaxPlayers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<uint>(
                name: "xmin",
                table: "rooms",
                type: "xid",
                rowVersion: true,
                nullable: false,
                defaultValue: 0u);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "xmin",
                table: "rooms");
        }
    }
}

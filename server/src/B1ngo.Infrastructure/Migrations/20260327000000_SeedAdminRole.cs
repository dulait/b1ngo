using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace B1ngo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminRole : Migration
    {
        private static readonly Guid AdminRoleId = new("a1b2c3d4-e5f6-7890-abcd-ef1234567890");

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "roles",
                schema: "identity",
                columns: new[] { "id", "name", "normalized_name", "concurrency_stamp" },
                values: new object[] { AdminRoleId, "Admin", "ADMIN", Guid.NewGuid().ToString() }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(table: "roles", schema: "identity", keyColumn: "id", keyValue: AdminRoleId);
        }
    }
}

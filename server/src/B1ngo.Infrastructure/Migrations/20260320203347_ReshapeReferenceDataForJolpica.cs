using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace B1ngo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReshapeReferenceDataForJolpica : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "session_type",
                table: "event_pool_entries",
                type: "varchar(50)",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.Sql(
                """
                UPDATE event_pool_entries e
                SET session_type = s.name
                FROM session_types s
                WHERE e.session_type_id = s.id;
                """
            );

            migrationBuilder.DropForeignKey(
                name: "FK_event_pool_entries_session_types_session_type_id",
                table: "event_pool_entries"
            );

            migrationBuilder.DropIndex(
                name: "IX_event_pool_entries_session_type_id_event_key",
                table: "event_pool_entries"
            );

            migrationBuilder.DropColumn(name: "session_type_id", table: "event_pool_entries");

            migrationBuilder.CreateIndex(
                name: "IX_event_pool_entries_session_type_event_key",
                table: "event_pool_entries",
                columns: new[] { "session_type", "event_key" },
                unique: true
            );

            migrationBuilder.DropTable(name: "session_types");

            migrationBuilder.RenameColumn(name: "sort_order", table: "grand_prix", newName: "round");

            migrationBuilder.AddColumn<bool>(
                name: "is_sprint",
                table: "grand_prix",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AddColumn<string>(
                name: "session_types",
                table: "grand_prix",
                type: "jsonb",
                nullable: false,
                defaultValue: "[]"
            );

            migrationBuilder.Sql("DELETE FROM grand_prix;");
            migrationBuilder.Sql("SELECT setval('grand_prix_id_seq', 1, false);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_event_pool_entries_session_type_event_key",
                table: "event_pool_entries"
            );

            migrationBuilder.DropColumn(name: "is_sprint", table: "grand_prix");

            migrationBuilder.DropColumn(name: "session_types", table: "grand_prix");

            migrationBuilder.DropColumn(name: "session_type", table: "event_pool_entries");

            migrationBuilder.RenameColumn(name: "round", table: "grand_prix", newName: "sort_order");

            migrationBuilder.AddColumn<int>(
                name: "session_type_id",
                table: "event_pool_entries",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.CreateTable(
                name: "session_types",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    display_name = table.Column<string>(type: "varchar(100)", nullable: false),
                    name = table.Column<string>(type: "varchar(50)", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_session_types", x => x.id);
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_event_pool_entries_session_type_id_event_key",
                table: "event_pool_entries",
                columns: new[] { "session_type_id", "event_key" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_session_types_name",
                table: "session_types",
                column: "name",
                unique: true
            );

            migrationBuilder.AddForeignKey(
                name: "FK_event_pool_entries_session_types_session_type_id",
                table: "event_pool_entries",
                column: "session_type_id",
                principalTable: "session_types",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace B1ngo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOutboxAndPlayerTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(name: "BingoCard", table: "players", newName: "Card");

            migrationBuilder.AddColumn<string>(
                name: "Configuration",
                table: "rooms",
                type: "jsonb",
                nullable: false,
                defaultValue: "{}"
            );

            migrationBuilder.AddColumn<string>(name: "Leaderboard", table: "rooms", type: "jsonb", nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "grand_prix_name",
                table: "rooms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<Guid>(
                name: "host_player_id",
                table: "rooms",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000")
            );

            migrationBuilder.AddColumn<int>(
                name: "season",
                table: "rooms",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<string>(
                name: "session_type",
                table: "rooms",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "rooms",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<bool>(
                name: "has_won",
                table: "players",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.CreateTable(
                name: "outbox_messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    event_type = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    payload = table.Column<string>(type: "jsonb", nullable: false),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    processed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    retry_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    error = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_outbox_messages", x => x.id);
                }
            );

            migrationBuilder.CreateTable(
                name: "player_tokens",
                columns: table => new
                {
                    token = table.Column<Guid>(type: "uuid", nullable: false),
                    player_id = table.Column<Guid>(type: "uuid", nullable: false),
                    room_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_host = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_player_tokens", x => x.token);
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_outbox_messages_processed_at",
                table: "outbox_messages",
                column: "processed_at",
                filter: "processed_at IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_player_tokens_player_id",
                table: "player_tokens",
                column: "player_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "outbox_messages");

            migrationBuilder.DropTable(name: "player_tokens");

            migrationBuilder.DropColumn(name: "Configuration", table: "rooms");

            migrationBuilder.DropColumn(name: "Leaderboard", table: "rooms");

            migrationBuilder.DropColumn(name: "grand_prix_name", table: "rooms");

            migrationBuilder.DropColumn(name: "host_player_id", table: "rooms");

            migrationBuilder.DropColumn(name: "season", table: "rooms");

            migrationBuilder.DropColumn(name: "session_type", table: "rooms");

            migrationBuilder.DropColumn(name: "status", table: "rooms");

            migrationBuilder.DropColumn(name: "has_won", table: "players");

            migrationBuilder.RenameColumn(name: "Card", table: "players", newName: "BingoCard");
        }
    }
}

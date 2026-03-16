using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace B1ngo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPlayerTokenForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_player_tokens_rooms_room_id",
                table: "player_tokens",
                column: "room_id",
                principalTable: "rooms",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_player_tokens_players_player_id",
                table: "player_tokens",
                column: "player_id",
                principalTable: "players",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.CreateIndex(name: "ix_player_tokens_room_id", table: "player_tokens", column: "room_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "ix_player_tokens_room_id", table: "player_tokens");

            migrationBuilder.DropForeignKey(name: "FK_player_tokens_players_player_id", table: "player_tokens");

            migrationBuilder.DropForeignKey(name: "FK_player_tokens_rooms_room_id", table: "player_tokens");
        }
    }
}

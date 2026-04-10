using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace B1ngo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomStartedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "started_at",
                table: "rooms",
                type: "timestamp with time zone",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "started_at", table: "rooms");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyConnect.Migrations
{
    /// <inheritdoc />
    public partial class AddColumn_Message_SeenTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "SeenTime",
                table: "Message",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SeenTime",
                table: "Message");
        }
    }
}

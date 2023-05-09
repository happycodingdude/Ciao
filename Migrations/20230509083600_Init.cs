using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MyDockerWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Category",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: true),
                    create_time = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    modify_time = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Category", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Publisher",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: true),
                    create_time = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    modify_time = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Publisher", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Book",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Title = table.Column<string>(type: "longtext", nullable: true),
                    Author = table.Column<string>(type: "longtext", nullable: true),
                    Language = table.Column<string>(type: "longtext", nullable: true),
                    Pages = table.Column<int>(type: "int", nullable: false),
                    PublisherId = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    create_time = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    modify_time = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Book", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Book_Category_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Category",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Book_Publisher_PublisherId",
                        column: x => x.PublisherId,
                        principalTable: "Publisher",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Category",
                columns: new[] { "Id", "Name", "create_time", "modify_time" },
                values: new object[] { 1, "Category 1", new DateTime(2023, 5, 9, 15, 36, 0, 120, DateTimeKind.Local).AddTicks(6253), new DateTime(2023, 5, 9, 15, 36, 0, 120, DateTimeKind.Local).AddTicks(6838) });

            migrationBuilder.InsertData(
                table: "Publisher",
                columns: new[] { "Id", "Name", "create_time", "modify_time" },
                values: new object[] { 1, "Publisher 1", new DateTime(2023, 5, 9, 15, 36, 0, 114, DateTimeKind.Local).AddTicks(2069), new DateTime(2023, 5, 9, 15, 36, 0, 115, DateTimeKind.Local).AddTicks(8485) });

            migrationBuilder.InsertData(
                table: "Book",
                columns: new[] { "Id", "Author", "CategoryId", "Language", "Pages", "PublisherId", "Title", "create_time", "modify_time" },
                values: new object[,]
                {
                    { 1, "Author 1", 1, "Language 1", 200, 1, "Title 1", new DateTime(2023, 5, 9, 15, 36, 0, 131, DateTimeKind.Local).AddTicks(3653), new DateTime(2023, 5, 9, 15, 36, 0, 131, DateTimeKind.Local).AddTicks(4294) },
                    { 2, "Author 2", 1, "Language 2", 300, 1, "Title 2", new DateTime(2023, 5, 9, 15, 36, 0, 131, DateTimeKind.Local).AddTicks(4909), new DateTime(2023, 5, 9, 15, 36, 0, 131, DateTimeKind.Local).AddTicks(4918) },
                    { 3, "Author 3", 1, "Language 3", 400, 1, "Title 3", new DateTime(2023, 5, 9, 15, 36, 0, 131, DateTimeKind.Local).AddTicks(4933), new DateTime(2023, 5, 9, 15, 36, 0, 131, DateTimeKind.Local).AddTicks(4936) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Book_CategoryId",
                table: "Book",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Book_PublisherId",
                table: "Book",
                column: "PublisherId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Book");

            migrationBuilder.DropTable(
                name: "Category");

            migrationBuilder.DropTable(
                name: "Publisher");
        }
    }
}

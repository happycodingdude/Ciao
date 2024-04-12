using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Chat.API.Migrations
{
    /// <inheritdoc />
    public partial class AlterTable_Participants_Participant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropForeignKey(
            //     name: "FK_Participants_Contact_ContactId",
            //     table: "Participants");

            // migrationBuilder.DropForeignKey(
            //     name: "FK_Participants_Conversation_ConversationId",
            //     table: "Participants");

            // migrationBuilder.DropPrimaryKey(
            //     name: "PK_Participants",
            //     table: "Participants");

            migrationBuilder.RenameTable(
                name: "Participants",
                newName: "Participant");

            // migrationBuilder.RenameIndex(
            //     name: "IX_Participants_ConversationId",
            //     table: "Participant",
            //     newName: "IX_Participant_ConversationId");

            // migrationBuilder.RenameIndex(
            //     name: "IX_Participants_ContactId",
            //     table: "Participant",
            //     newName: "IX_Participant_ContactId");

            // migrationBuilder.AddPrimaryKey(
            //     name: "PK_Participant",
            //     table: "Participant",
            //     column: "Id");

            // migrationBuilder.AddForeignKey(
            //     name: "FK_Participant_Contact_ContactId",
            //     table: "Participant",
            //     column: "ContactId",
            //     principalTable: "Contact",
            //     principalColumn: "Id",
            //     onDelete: ReferentialAction.Cascade);

            // migrationBuilder.AddForeignKey(
            //     name: "FK_Participant_Conversation_ConversationId",
            //     table: "Participant",
            //     column: "ConversationId",
            //     principalTable: "Conversation",
            //     principalColumn: "Id",
            //     onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropForeignKey(
            //     name: "FK_Participant_Contact_ContactId",
            //     table: "Participant");

            // migrationBuilder.DropForeignKey(
            //     name: "FK_Participant_Conversation_ConversationId",
            //     table: "Participant");

            // migrationBuilder.DropPrimaryKey(
            //     name: "PK_Participant",
            //     table: "Participant");

            migrationBuilder.RenameTable(
                name: "Participant",
                newName: "Participants");

            // migrationBuilder.RenameIndex(
            //     name: "IX_Participant_ConversationId",
            //     table: "Participants",
            //     newName: "IX_Participants_ConversationId");

            // migrationBuilder.RenameIndex(
            //     name: "IX_Participant_ContactId",
            //     table: "Participants",
            //     newName: "IX_Participants_ContactId");

            // migrationBuilder.AddPrimaryKey(
            //     name: "PK_Participants",
            //     table: "Participants",
            //     column: "Id");

            // migrationBuilder.AddForeignKey(
            //     name: "FK_Participants_Contact_ContactId",
            //     table: "Participants",
            //     column: "ContactId",
            //     principalTable: "Contact",
            //     principalColumn: "Id",
            //     onDelete: ReferentialAction.Cascade);

            // migrationBuilder.AddForeignKey(
            //     name: "FK_Participants_Conversation_ConversationId",
            //     table: "Participants",
            //     column: "ConversationId",
            //     principalTable: "Conversation",
            //     principalColumn: "Id",
            //     onDelete: ReferentialAction.Cascade);
        }
    }
}

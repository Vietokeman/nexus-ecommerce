using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Customer.API.Migrations
{
    /// <inheritdoc />
    public partial class Fixnametable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Products",
                table: "Products");

            migrationBuilder.RenameTable(
                name: "Products",
                newName: "Customers");

            migrationBuilder.RenameIndex(
                name: "IX_Products_UserName",
                table: "Customers",
                newName: "IX_Customers_UserName");

            migrationBuilder.RenameIndex(
                name: "IX_Products_EmailAddress",
                table: "Customers",
                newName: "IX_Customers_EmailAddress");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Customers",
                table: "Customers",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Customers",
                table: "Customers");

            migrationBuilder.RenameTable(
                name: "Customers",
                newName: "Products");

            migrationBuilder.RenameIndex(
                name: "IX_Customers_UserName",
                table: "Products",
                newName: "IX_Products_UserName");

            migrationBuilder.RenameIndex(
                name: "IX_Customers_EmailAddress",
                table: "Products",
                newName: "IX_Products_EmailAddress");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Products",
                table: "Products",
                column: "Id");
        }
    }
}

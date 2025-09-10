using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Product.API.Migrations
{
    /// <inheritdoc />
    public partial class AutoIncreament : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE `CatalogProducts` MODIFY COLUMN `Id` BIGINT NOT NULL AUTO_INCREMENT;");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE `CatalogProducts` MODIFY COLUMN `Id` BIGINT NOT NULL;");
        }

    }
}

using Inventory.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace Inventory.API.Persistence
{
    /// <summary>
    /// EF Core DbContext for Inventory service (migrated from MongoDB).
    /// Uses PostgreSQL with PostGIS for geo-spatial warehouse queries.
    /// </summary>
    public class InventoryContext : DbContext
    {
        public InventoryContext(DbContextOptions<InventoryContext> options) : base(options)
        {
        }

        public DbSet<InventoryEntry> InventoryEntries { get; set; } = null!;
        public DbSet<Warehouse> Warehouses { get; set; } = null!;
        public DbSet<WarehouseStock> WarehouseStocks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Enable PostGIS
            modelBuilder.HasPostgresExtension("postgis");

            // InventoryEntry
            modelBuilder.Entity<InventoryEntry>(entity =>
            {
                entity.ToTable("InventoryEntries");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.ItemNo);
                entity.HasIndex(e => e.DocumentNo);
                entity.HasIndex(e => e.CreatedDate).IsDescending();
                entity.HasOne(e => e.Warehouse)
                    .WithMany(w => w.InventoryEntries)
                    .HasForeignKey(e => e.WarehouseId)
                    .IsRequired(false);
            });

            // Warehouse
            modelBuilder.Entity<Warehouse>(entity =>
            {
                entity.ToTable("Warehouses");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Code).IsUnique();
                entity.Property(e => e.Location).HasColumnType("geography (point)");
            });

            // WarehouseStock
            modelBuilder.Entity<WarehouseStock>(entity =>
            {
                entity.ToTable("WarehouseStocks");
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => new { e.WarehouseId, e.ItemNo }).IsUnique();
                entity.HasOne(e => e.Warehouse)
                    .WithMany(w => w.Stocks)
                    .HasForeignKey(e => e.WarehouseId);
            });

            // Seed default warehouses
            modelBuilder.Entity<Warehouse>().HasData(
                new Warehouse
                {
                    Id = 1,
                    Code = "WH-HCM",
                    Name = "Ho Chi Minh Warehouse",
                    Address = "123 Nguyen Van Linh, Q7",
                    City = "Ho Chi Minh City",
                    Province = "Ho Chi Minh",
                    IsActive = true,
                    Capacity = 50000,
                    CreatedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Warehouse
                {
                    Id = 2,
                    Code = "WH-HN",
                    Name = "Ha Noi Warehouse",
                    Address = "456 Pham Van Dong, Bac Tu Liem",
                    City = "Ha Noi",
                    Province = "Ha Noi",
                    IsActive = true,
                    Capacity = 30000,
                    CreatedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new Warehouse
                {
                    Id = 3,
                    Code = "WH-DN",
                    Name = "Da Nang Warehouse",
                    Address = "789 Nguyen Huu Tho, Cam Le",
                    City = "Da Nang",
                    Province = "Da Nang",
                    IsActive = true,
                    Capacity = 20000,
                    CreatedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}

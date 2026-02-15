using FlashSale.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlashSale.API.Persistence;

public class FlashSaleContext : DbContext
{
    public FlashSaleContext(DbContextOptions<FlashSaleContext> options) : base(options) { }

    public DbSet<FlashSaleSession> FlashSaleSessions { get; set; } = null!;
    public DbSet<FlashSaleItem> FlashSaleItems { get; set; } = null!;
    public DbSet<FlashSaleOrder> FlashSaleOrders { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // FlashSaleSession
        modelBuilder.Entity<FlashSaleSession>(e =>
        {
            e.ToTable("FlashSaleSessions");
            e.HasIndex(s => s.Status);
            e.HasIndex(s => new { s.StartTime, s.EndTime });
        });

        // FlashSaleItem
        modelBuilder.Entity<FlashSaleItem>(e =>
        {
            e.ToTable("FlashSaleItems");
            e.HasIndex(i => i.ProductNo);
            e.HasIndex(i => i.SessionId);
            e.HasOne(i => i.Session)
                .WithMany(s => s.Items)
                .HasForeignKey(i => i.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // FlashSaleOrder
        modelBuilder.Entity<FlashSaleOrder>(e =>
        {
            e.ToTable("FlashSaleOrders");
            e.HasIndex(o => new { o.ItemId, o.UserName });
            e.HasIndex(o => o.UserName);
            e.HasOne(o => o.Item)
                .WithMany()
                .HasForeignKey(o => o.ItemId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

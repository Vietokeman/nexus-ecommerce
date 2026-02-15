using Microsoft.EntityFrameworkCore;
using Payment.API.Entities;

namespace Payment.API.Persistence;

public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options)
    {
    }

    public DbSet<PaymentTransaction> PaymentTransactions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PaymentTransaction>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.OrderCode)
                .IsRequired();

            entity.Property(e => e.OrderNo)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.Currency)
                .HasMaxLength(10)
                .HasDefaultValue("VND");

            entity.Property(e => e.Status)
                .HasConversion<int>();

            entity.Property(e => e.PaymentUrl)
                .HasMaxLength(1000);

            entity.Property(e => e.PayOSTransactionId)
                .HasMaxLength(100);

            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(50);

            entity.Property(e => e.Description)
                .HasMaxLength(500);

            entity.Property(e => e.CancellationReason)
                .HasMaxLength(500);

            entity.HasIndex(e => e.OrderCode).IsUnique();
            entity.HasIndex(e => e.OrderNo);
            entity.HasIndex(e => e.UserId);
        });
    }
}

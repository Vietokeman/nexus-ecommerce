using Microsoft.EntityFrameworkCore;
using Seller.API.Entities;
using Contracts.Domains.Interfaces;

namespace Seller.API.Persistence
{
    public class SellerContext : DbContext
    {
        public SellerContext(DbContextOptions<SellerContext> options) : base(options) { }

        public DbSet<SellerProduct> SellerProducts { get; set; }
        public DbSet<ProductReview> ProductReviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // SellerProduct configuration
            modelBuilder.Entity<SellerProduct>(e =>
            {
                e.ToTable("SellerProducts");
                e.HasKey(x => x.Id);
                e.HasIndex(x => x.No).IsUnique();
                e.HasIndex(x => x.SellerUserName);
                e.HasIndex(x => x.Status);
                e.HasIndex(x => x.Category);
                e.Property(x => x.Name).IsRequired().HasMaxLength(250);
                e.Property(x => x.No).IsRequired().HasMaxLength(50);
            });

            // ProductReview configuration
            modelBuilder.Entity<ProductReview>(e =>
            {
                e.ToTable("ProductReviews");
                e.HasKey(x => x.Id);
                e.HasIndex(x => x.ProductId);
                e.HasIndex(x => x.UserName);
                e.HasIndex(x => new { x.ProductId, x.UserName, x.OrderId }).IsUnique();
                e.Property(x => x.UserName).IsRequired().HasMaxLength(100);
                e.Property(x => x.Rating).IsRequired();
            });
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            var modified = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Modified ||
                            e.State == EntityState.Added);

            foreach (var item in modified)
            {
                switch (item.State)
                {
                    case EntityState.Added:
                        if (item.Entity is IDateTracking addedEntity)
                        {
                            addedEntity.CreatedDate = DateTimeOffset.UtcNow;
                            addedEntity.LastModifiedDate = DateTimeOffset.UtcNow;
                        }
                        item.State = EntityState.Added;
                        break;

                    case EntityState.Modified:
                        Entry(item.Entity).Property("Id").IsModified = false;
                        if (item.Entity is IDateTracking modifiedEntity)
                        {
                            modifiedEntity.LastModifiedDate = DateTimeOffset.UtcNow;
                        }
                        break;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}

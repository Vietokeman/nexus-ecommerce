using Contracts.Domains.Interfaces;
using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Entities;

namespace Ordering.Infrastructure.Persistence
{
    public class OrderContext : DbContext
    {
        public OrderContext(DbContextOptions<OrderContext> options) : base(options)
        {
        }

        public DbSet<Order> Orders { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Order>().ToTable("Orders");
            modelBuilder.Entity<Order>().HasKey(o => o.Id);
            modelBuilder.Entity<Order>().Property(o => o.UserName).IsRequired();
            modelBuilder.Entity<Order>().Property(o => o.FirstName).IsRequired().HasMaxLength(50);
            modelBuilder.Entity<Order>().Property(o => o.LastName).IsRequired().HasMaxLength(250);
            modelBuilder.Entity<Order>().Property(o => o.EmailAdress).IsRequired();
            modelBuilder.Entity<Order>().Property(o => o.TotalPrice).HasColumnType("decimal(10,2)");
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            var modified = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Modified ||
                            e.State == EntityState.Added ||
                            e.State == EntityState.Deleted);

            foreach (var itemEntity in modified)
            {
                switch (itemEntity.State)
                {
                    case EntityState.Added:
                        if (itemEntity.Entity is IDateTracking addedEntity)
                        {
                            addedEntity.CreatedDate = DateTime.UtcNow;
                            itemEntity.State = EntityState.Added;
                        }
                        break;

                    case EntityState.Modified:
                        Entry(itemEntity.Entity).Property("Id").IsModified = false;
                        if (itemEntity.Entity is IDateTracking modifiedEntity)
                        {
                            modifiedEntity.LastModifiedDate = DateTime.UtcNow;
                            itemEntity.State = EntityState.Modified;
                        }
                        break;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}

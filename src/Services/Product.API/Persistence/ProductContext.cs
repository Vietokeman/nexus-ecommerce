using Contracts.Domains.Interfaces;
using Microsoft.EntityFrameworkCore;
using Product.API.Entities;

namespace Product.API.Persistence
{
    public class ProductContext : DbContext
    {
        public ProductContext(DbContextOptions<ProductContext> options) : base(options)
        {
        }

        public DbSet<CatalogProduct> Products { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<CatalogProduct>().ToTable("CatalogProducts");
            modelBuilder.Entity<CatalogProduct>().HasKey(p => p.Id);
            modelBuilder.Entity<CatalogProduct>().HasIndex(p => p.No).IsUnique();
            modelBuilder.Entity<CatalogProduct>().Property(p => p.Name).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<CatalogProduct>().Property(p => p.Description).HasMaxLength(500);
            modelBuilder.Entity<CatalogProduct>().Property(p => p.Price).HasColumnType("decimal(18,2)");
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
                        //case EntityState.Deleted:
                        //    if (itemEntity.Entity is IDateTracking deletedEntity)
                        //    {
                        //        deletedEntity.LastModifiedDate = DateTime.UtcNow;
                        //        itemEntity.State = EntityState.Modified; // Change to Modified to keep the record
                        //    }
                        //    break; 
                        //chua trien khai
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }


    }

}

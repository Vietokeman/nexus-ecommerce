using Microsoft.EntityFrameworkCore;
using Nexus.AI.Service.Entities;
using Pgvector;

namespace Nexus.AI.Service.Persistence;

public sealed class NexusAiDbContext(DbContextOptions<NexusAiDbContext> options) : DbContext(options)
{
    public DbSet<ProductVector> ProductVectors => Set<ProductVector>();

    public DbSet<ChatSession> ChatSessions => Set<ChatSession>();

    public DbSet<ChatMessageRecord> ChatMessages => Set<ChatMessageRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("vector");

        modelBuilder.Entity<ProductVector>(entity =>
        {
            entity.ToTable("product_vectors");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.ProductId).IsUnique();
            entity.HasIndex(x => x.ProductNo).IsUnique();
            entity.Property(x => x.ProductNo).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Name).HasMaxLength(250).IsRequired();
            entity.Property(x => x.Category).HasMaxLength(100);
            entity.Property(x => x.ImageUrl).HasMaxLength(500);
            entity.Property(x => x.Price).HasColumnType("decimal(12,2)");
            entity.Property(x => x.AttributesJson).HasColumnType("jsonb");
            entity.Property(x => x.SourcePayload).HasColumnType("jsonb");
            entity.Property(x => x.EmbeddingText).HasColumnType("text");
            entity.Property(x => x.Summary).HasColumnType("text");
            entity.Property(x => x.Description).HasColumnType("text");
            entity.Property(x => x.Embedding).HasColumnType("vector");
        });

        modelBuilder.Entity<ChatSession>(entity =>
        {
            entity.ToTable("chat_sessions");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.UserId).HasMaxLength(128);
            entity.HasMany(x => x.Messages)
                .WithOne(x => x.Session)
                .HasForeignKey(x => x.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChatMessageRecord>(entity =>
        {
            entity.ToTable("chat_messages");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.SessionId, x.CreatedAtUtc });
            entity.Property(x => x.Role).HasMaxLength(32).IsRequired();
            entity.Property(x => x.Content).HasColumnType("text").IsRequired();
            entity.Property(x => x.MetadataJson).HasColumnType("jsonb");
        });
    }
}

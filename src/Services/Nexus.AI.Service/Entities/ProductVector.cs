using Pgvector;

namespace Nexus.AI.Service.Entities;

public sealed class ProductVector
{
    public long Id { get; set; }

    public long ProductId { get; set; }

    public string ProductNo { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Summary { get; set; }

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? AttributesJson { get; set; }

    public string? Category { get; set; }

    public string? ImageUrl { get; set; }

    public string EmbeddingText { get; set; } = string.Empty;

    public string SourcePayload { get; set; } = string.Empty;

    public Vector? Embedding { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset LastSyncedAtUtc { get; set; }
}

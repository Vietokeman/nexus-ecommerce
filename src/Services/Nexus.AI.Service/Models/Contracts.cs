using System.ComponentModel.DataAnnotations;

namespace Nexus.AI.Service.Models;

public sealed record ProductCatalogItem(
    long Id,
    string No,
    string Name,
    string? Summary,
    string? Description,
    decimal Price,
    string? Attributes,
    string? Category,
    string? ImageUrl);

public sealed record ProductSearchResult(
    long ProductId,
    string ProductNo,
    string Name,
    decimal Price,
    string? Category,
    string? Summary,
    string? ImageUrl,
    double Score);

public sealed class ChatRequest
{
    public Guid? SessionId { get; set; }

    [MaxLength(128)]
    public string? UserId { get; set; }

    [Required]
    [MinLength(2)]
    public string Message { get; set; } = string.Empty;

    [Range(1, 10)]
    public int? TopK { get; set; }
}

public sealed record ChatResponse(
    Guid SessionId,
    string Reply,
    string? ModelId,
    IReadOnlyCollection<ProductSearchResult> Grounding,
    DateTimeOffset CreatedAtUtc);

public sealed record ChatMessageDto(
    long Id,
    string Role,
    string Content,
    DateTimeOffset CreatedAtUtc);

public sealed record ChatSessionResponse(
    Guid SessionId,
    string? UserId,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    IReadOnlyCollection<ChatMessageDto> Messages);

public sealed record ProductSyncResult(
    int Requested,
    int Created,
    int Updated,
    int Failed,
    DateTimeOffset CompletedAtUtc,
    IReadOnlyCollection<string> Errors);

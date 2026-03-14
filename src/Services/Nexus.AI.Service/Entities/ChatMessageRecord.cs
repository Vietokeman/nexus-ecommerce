namespace Nexus.AI.Service.Entities;

public sealed class ChatMessageRecord
{
    public long Id { get; set; }

    public Guid SessionId { get; set; }

    public string Role { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string? MetadataJson { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public ChatSession Session { get; set; } = null!;
}

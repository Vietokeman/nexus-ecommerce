namespace Nexus.AI.Service.Entities;

public sealed class ChatSession
{
    public Guid Id { get; set; }

    public string? UserId { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset LastMessageAtUtc { get; set; }

    public ICollection<ChatMessageRecord> Messages { get; set; } = new List<ChatMessageRecord>();
}

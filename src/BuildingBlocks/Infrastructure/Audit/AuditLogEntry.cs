namespace Infrastructure.Audit;

public class AuditLogEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;
    public string ServiceName { get; set; } = string.Empty;
    public string Operation { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string ActorId { get; set; } = "anonymous";
    public string ActorName { get; set; } = "anonymous";
    public string? CorrelationId { get; set; }
    public string? RequestPath { get; set; }
    public string? RequestMethod { get; set; }
    public Dictionary<string, AuditValueChange> Changes { get; set; } = new();
}

public class AuditValueChange
{
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
}

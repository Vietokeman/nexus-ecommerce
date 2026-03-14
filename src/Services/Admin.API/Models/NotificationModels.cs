namespace Admin.API.Models;

public sealed class NotificationModel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string? Link { get; set; }

    public string? Type { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class CreateNotificationRequest
{
    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string? Link { get; set; }

    public string? Type { get; set; }
}

public sealed class AuditLogItemModel
{
    public string Id { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; }

    public string User { get; set; } = string.Empty;

    public string Action { get; set; } = string.Empty;

    public string EntityName { get; set; } = string.Empty;

    public string? EntityId { get; set; }

    public string? CorrelationId { get; set; }

    public string? ChangesJson { get; set; }
}

using System.Collections.Concurrent;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Audit;

public class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    private static readonly HashSet<string> SensitiveFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "Password", "PasswordHash", "RefreshToken", "Token", "AccessToken", "SecurityStamp"
    };

    private readonly ConcurrentDictionary<Guid, List<PendingAuditEntry>> _pendingByContext = new();
    private readonly IAuditLogChannel _auditLogChannel;
    private readonly AuditLoggingOptions _options;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<AuditSaveChangesInterceptor> _logger;

    public AuditSaveChangesInterceptor(
        IAuditLogChannel auditLogChannel,
        IOptions<AuditLoggingOptions> options,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuditSaveChangesInterceptor> logger)
    {
        _auditLogChannel = auditLogChannel;
        _options = options.Value;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        CaptureEntries(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        CaptureEntries(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        EnqueueAuditEntriesAsync(eventData.Context, CancellationToken.None).GetAwaiter().GetResult();
        return base.SavedChanges(eventData, result);
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        await EnqueueAuditEntriesAsync(eventData.Context, cancellationToken);
        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    public override void SaveChangesFailed(DbContextErrorEventData eventData)
    {
        if (eventData.Context != null)
        {
            _pendingByContext.TryRemove(eventData.Context.ContextId.InstanceId, out _);
        }

        base.SaveChangesFailed(eventData);
    }

    public override Task SaveChangesFailedAsync(
        DbContextErrorEventData eventData,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context != null)
        {
            _pendingByContext.TryRemove(eventData.Context.ContextId.InstanceId, out _);
        }

        return base.SaveChangesFailedAsync(eventData, cancellationToken);
    }

    private void CaptureEntries(DbContext? context)
    {
        if (!_options.Enabled || context == null)
        {
            return;
        }

        var entries = context.ChangeTracker
            .Entries()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .Where(e => e.Entity is not AuditLogEntry)
            .Select(CreatePendingAuditEntry)
            .Where(e => e != null)
            .Cast<PendingAuditEntry>()
            .ToList();

        if (entries.Count == 0)
        {
            return;
        }

        _pendingByContext[context.ContextId.InstanceId] = entries;
    }

    private async Task EnqueueAuditEntriesAsync(DbContext? context, CancellationToken cancellationToken)
    {
        if (!_options.Enabled || context == null)
        {
            return;
        }

        if (!_pendingByContext.TryRemove(context.ContextId.InstanceId, out var pendingEntries) || pendingEntries.Count == 0)
        {
            return;
        }

        var (actorId, actorName, requestPath, requestMethod, correlationId) = GetRequestContext();

        foreach (var pending in pendingEntries)
        {
            var entityId = ResolveEntityId(pending.Entry);
            var auditEntry = new AuditLogEntry
            {
                OccurredAtUtc = DateTime.UtcNow,
                ServiceName = _options.ServiceName,
                Operation = pending.Operation,
                EntityName = pending.Entry.Entity.GetType().Name,
                EntityId = entityId,
                ActorId = actorId,
                ActorName = actorName,
                RequestPath = requestPath,
                RequestMethod = requestMethod,
                CorrelationId = correlationId,
                Changes = pending.Changes
            };

            try
            {
                await _auditLogChannel.WriteAsync(auditEntry, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to enqueue audit entry for {Entity}", auditEntry.EntityName);
            }
        }
    }

    private static PendingAuditEntry? CreatePendingAuditEntry(EntityEntry entry)
    {
        var operation = entry.State switch
        {
            EntityState.Added => "Create",
            EntityState.Modified => "Update",
            EntityState.Deleted => "Delete",
            _ => string.Empty
        };

        if (string.IsNullOrWhiteSpace(operation))
        {
            return null;
        }

        var changes = new Dictionary<string, AuditValueChange>(StringComparer.OrdinalIgnoreCase);

        foreach (var property in entry.Properties)
        {
            if (property.Metadata.IsPrimaryKey() || SensitiveFields.Contains(property.Metadata.Name))
            {
                continue;
            }

            switch (entry.State)
            {
                case EntityState.Added:
                    changes[property.Metadata.Name] = new AuditValueChange
                    {
                        OldValue = null,
                        NewValue = ToSafeString(property.CurrentValue)
                    };
                    break;

                case EntityState.Deleted:
                    changes[property.Metadata.Name] = new AuditValueChange
                    {
                        OldValue = ToSafeString(property.OriginalValue),
                        NewValue = null
                    };
                    break;

                case EntityState.Modified:
                    if (property.IsModified)
                    {
                        changes[property.Metadata.Name] = new AuditValueChange
                        {
                            OldValue = ToSafeString(property.OriginalValue),
                            NewValue = ToSafeString(property.CurrentValue)
                        };
                    }
                    break;
            }
        }

        return new PendingAuditEntry(entry, operation, changes);
    }

    private static string ResolveEntityId(EntityEntry entry)
    {
        var key = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
        return ToSafeString(key?.CurrentValue) ?? "unknown";
    }

    private (string ActorId, string ActorName, string? RequestPath, string? RequestMethod, string? CorrelationId) GetRequestContext()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var user = httpContext?.User;

        var actorId = user?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user?.FindFirstValue("sub")
            ?? "system";
        var actorName = user?.Identity?.Name
            ?? user?.FindFirstValue(ClaimTypes.Email)
            ?? "system";

        return (
            actorId,
            actorName,
            httpContext?.Request.Path.Value,
            httpContext?.Request.Method,
            httpContext?.TraceIdentifier);
    }

    private static string? ToSafeString(object? value)
    {
        if (value == null)
        {
            return null;
        }

        var raw = value.ToString();
        if (string.IsNullOrEmpty(raw))
        {
            return raw;
        }

        return raw.Length > 1024 ? raw[..1024] : raw;
    }

    private sealed record PendingAuditEntry(
        EntityEntry Entry,
        string Operation,
        Dictionary<string, AuditValueChange> Changes);
}

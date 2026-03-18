using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Admin.API.Models;

namespace Admin.API.Services;

public interface IAuditLogService
{
    Task<PageResult<AuditLogItemModel>> SearchAsync(string? searchTerm, DateTime? startDate, DateTime? endDate, int page, int pageSize, CancellationToken cancellationToken = default);
}

public sealed class AuditLogService(IHttpClientFactory httpClientFactory) : IAuditLogService
{
    public async Task<PageResult<AuditLogItemModel>> SearchAsync(string? searchTerm, DateTime? startDate, DateTime? endDate, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var safePage = Math.Max(page, 1);
        var safeSize = Math.Clamp(pageSize, 1, 200);
        var from = (safePage - 1) * safeSize;

        var payload = BuildElasticPayload(searchTerm, startDate, endDate, from, safeSize);
        var client = httpClientFactory.CreateClient("admin-elasticsearch");

        using var response = await client.PostAsync("/audit-logs-*/_search", new StringContent(payload, Encoding.UTF8, "application/json"), cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return new PageResult<AuditLogItemModel>
            {
                Results = [],
                CurrentPage = safePage,
                PageSize = safeSize,
                RowCount = 0
            };
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var root = document.RootElement;

        var total = ReadTotal(root);
        var results = ReadItems(root);

        return new PageResult<AuditLogItemModel>
        {
            Results = results,
            CurrentPage = safePage,
            PageSize = safeSize,
            RowCount = total
        };
    }

    private static string BuildElasticPayload(string? searchTerm, DateTime? startDate, DateTime? endDate, int from, int size)
    {
        var must = new JsonArray();
        var filter = new JsonArray();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            must.Add(new JsonObject
            {
                ["multi_match"] = new JsonObject
                {
                    ["query"] = searchTerm,
                    ["fields"] = new JsonArray("operation", "entityName", "actorName", "actorId", "requestPath", "changes.*.oldValue", "changes.*.newValue")
                }
            });
        }

        if (startDate.HasValue || endDate.HasValue)
        {
            var range = new JsonObject();
            if (startDate.HasValue)
            {
                range["gte"] = startDate.Value.ToUniversalTime().ToString("O");
            }

            if (endDate.HasValue)
            {
                range["lte"] = endDate.Value.ToUniversalTime().ToString("O");
            }

            filter.Add(new JsonObject
            {
                ["range"] = new JsonObject
                {
                    ["occurredAtUtc"] = range
                }
            });
        }

        var queryObject = new JsonObject
        {
            ["bool"] = new JsonObject
            {
                ["must"] = must,
                ["filter"] = filter
            }
        };

        var root = new JsonObject
        {
            ["from"] = from,
            ["size"] = size,
            ["sort"] = new JsonArray
            {
                new JsonObject
                {
                    ["occurredAtUtc"] = new JsonObject
                    {
                        ["order"] = "desc"
                    }
                }
            },
            ["query"] = queryObject
        };

        return root.ToJsonString();
    }

    private static int ReadTotal(JsonElement root)
    {
        if (!root.TryGetProperty("hits", out var hitsElement))
        {
            return 0;
        }

        if (!hitsElement.TryGetProperty("total", out var totalElement))
        {
            return 0;
        }

        if (totalElement.ValueKind == JsonValueKind.Number && totalElement.TryGetInt32(out var directValue))
        {
            return directValue;
        }

        if (totalElement.ValueKind == JsonValueKind.Object
            && totalElement.TryGetProperty("value", out var valueElement)
            && valueElement.TryGetInt32(out var nestedValue))
        {
            return nestedValue;
        }

        return 0;
    }

    private static IReadOnlyList<AuditLogItemModel> ReadItems(JsonElement root)
    {
        var items = new List<AuditLogItemModel>();

        if (!root.TryGetProperty("hits", out var hitsElement)
            || !hitsElement.TryGetProperty("hits", out var innerHits)
            || innerHits.ValueKind != JsonValueKind.Array)
        {
            return items;
        }

        foreach (var hit in innerHits.EnumerateArray())
        {
            if (!hit.TryGetProperty("_source", out var source))
            {
                continue;
            }

            var id = hit.TryGetProperty("_id", out var idElement) ? idElement.GetString() ?? string.Empty : string.Empty;
            var timestampRaw = source.TryGetProperty("occurredAtUtc", out var ts) ? ts.GetString() : null;
            var timestamp = DateTime.TryParse(timestampRaw, out var parsedTimestamp)
                ? parsedTimestamp
                : DateTime.UtcNow;

            var actorName = source.TryGetProperty("actorName", out var actorNameElement) ? actorNameElement.GetString() : null;
            var actorId = source.TryGetProperty("actorId", out var actorIdElement) ? actorIdElement.GetString() : null;
            var user = string.IsNullOrWhiteSpace(actorName) ? actorId ?? "system" : actorName;

            var changesJson = source.TryGetProperty("changes", out var changesElement)
                ? changesElement.GetRawText()
                : null;

            items.Add(new AuditLogItemModel
            {
                Id = id,
                Timestamp = timestamp,
                User = user,
                Action = source.TryGetProperty("operation", out var operation) ? operation.GetString() ?? "Unknown" : "Unknown",
                EntityName = source.TryGetProperty("entityName", out var entity) ? entity.GetString() ?? "Unknown" : "Unknown",
                EntityId = source.TryGetProperty("entityId", out var entityId) ? entityId.GetString() : null,
                CorrelationId = source.TryGetProperty("correlationId", out var correlation) ? correlation.GetString() : null,
                ChangesJson = changesJson
            });
        }

        return items;
    }
}

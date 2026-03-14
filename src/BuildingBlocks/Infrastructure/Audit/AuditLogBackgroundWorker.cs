using Elastic.Clients.Elasticsearch;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Audit;

public class AuditLogBackgroundWorker : BackgroundService
{
    private readonly IAuditLogChannel _auditLogChannel;
    private readonly ElasticsearchClient _elasticsearchClient;
    private readonly AuditLoggingOptions _options;
    private readonly ILogger<AuditLogBackgroundWorker> _logger;

    public AuditLogBackgroundWorker(
        IAuditLogChannel auditLogChannel,
        ElasticsearchClient elasticsearchClient,
        IOptions<AuditLoggingOptions> options,
        ILogger<AuditLogBackgroundWorker> logger)
    {
        _auditLogChannel = auditLogChannel;
        _elasticsearchClient = elasticsearchClient;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var entry in _auditLogChannel.Reader.ReadAllAsync(stoppingToken))
        {
            if (!_options.Enabled)
            {
                continue;
            }

            await IndexWithRetryAsync(entry, stoppingToken);
        }
    }

    private async Task IndexWithRetryAsync(AuditLogEntry entry, CancellationToken cancellationToken)
    {
        var indexName = $"{_options.IndexPrefix}-{DateTime.UtcNow:yyyy.MM.dd}";

        for (var attempt = 1; attempt <= _options.MaxRetryCount; attempt++)
        {
            try
            {
                var response = await _elasticsearchClient.IndexAsync(
                    entry,
                    index => index.Index(indexName).Id(entry.Id),
                    cancellationToken);

                if (response.IsValidResponse)
                {
                    return;
                }

                _logger.LogWarning(
                    "Audit index response invalid at attempt {Attempt} for {Entity}#{EntityId}. Error: {Error}",
                    attempt,
                    entry.EntityName,
                    entry.EntityId,
                    response.ElasticsearchServerError?.Error?.Reason ?? "unknown");
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to index audit log at attempt {Attempt} for {Entity}#{EntityId}",
                    attempt,
                    entry.EntityName,
                    entry.EntityId);
            }

            if (attempt < _options.MaxRetryCount)
            {
                await Task.Delay(TimeSpan.FromMilliseconds(200 * attempt), cancellationToken);
            }
        }
    }
}

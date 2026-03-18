namespace Infrastructure.Audit;

public class AuditLoggingOptions
{
    public const string SectionName = "AuditLogging";

    public bool Enabled { get; set; } = true;
    public string ServiceName { get; set; } = string.Empty;
    public string ElasticsearchUri { get; set; } = "http://localhost:9200";
    public string IndexPrefix { get; set; } = "audit-logs";
    public int ChannelCapacity { get; set; } = 5000;
    public int MaxRetryCount { get; set; } = 3;
}

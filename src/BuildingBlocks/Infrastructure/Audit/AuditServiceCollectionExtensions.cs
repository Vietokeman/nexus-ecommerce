using Elastic.Clients.Elasticsearch;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Infrastructure.Audit;

public static class AuditServiceCollectionExtensions
{
    public static IServiceCollection AddAuditLogging(this IServiceCollection services, IConfiguration configuration, string serviceName)
    {
        services.AddHttpContextAccessor();

        services.AddOptions<AuditLoggingOptions>()
            .Bind(configuration.GetSection(AuditLoggingOptions.SectionName))
            .Configure(options =>
            {
                options.ServiceName = serviceName;
                options.IndexPrefix = string.IsNullOrWhiteSpace(options.IndexPrefix)
                    ? "audit-logs"
                    : options.IndexPrefix;

                if (string.IsNullOrWhiteSpace(options.ElasticsearchUri))
                {
                    options.ElasticsearchUri = configuration["ElasticConfiguration:Uri"] ?? "http://localhost:9200";
                }
            });

        services.AddSingleton(sp =>
        {
            var options = sp.GetRequiredService<IOptions<AuditLoggingOptions>>().Value;
            return new AuditLogChannel(options);
        });
        services.AddSingleton<IAuditLogChannel>(sp => sp.GetRequiredService<AuditLogChannel>());

        services.AddSingleton(sp =>
        {
            var options = sp.GetRequiredService<IOptions<AuditLoggingOptions>>().Value;
            var settings = new ElasticsearchClientSettings(new Uri(options.ElasticsearchUri));
            return new ElasticsearchClient(settings);
        });

        services.AddScoped<AuditSaveChangesInterceptor>();
        services.AddHostedService<AuditLogBackgroundWorker>();

        return services;
    }
}

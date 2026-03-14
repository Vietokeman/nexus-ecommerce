using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.Google;
using Nexus.AI.Service.Filters;
using Nexus.AI.Service.Middleware;
using Nexus.AI.Service.Options;
using Nexus.AI.Service.Persistence;
using Nexus.AI.Service.Plugins;
using Nexus.AI.Service.Services;
using Pgvector.EntityFrameworkCore;

namespace Nexus.AI.Service.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AiOptions>(configuration.GetSection("Ai"));

        services.AddHttpContextAccessor();
        services.AddHttpClient<IProductCatalogClient, ProductCatalogClient>((serviceProvider, client) =>
        {
            var options = serviceProvider.GetRequiredService<IOptions<AiOptions>>().Value;
            client.BaseAddress = new Uri(options.ProductCatalog.BaseUrl);
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        services.AddScoped<ProductSearchPlugin>();
        services.AddScoped<OrderSupportPlugin>();
        services.AddScoped<IFunctionInvocationFilter, KernelLoggingFilter>();
        services.AddScoped<IAutoFunctionInvocationFilter, KernelAutoInvocationFilter>();
        services.AddScoped<IEmbeddingService, GeminiEmbeddingService>();
        services.AddScoped<IProductVectorService, ProductVectorService>();
        services.AddScoped<IConversationService, ConversationService>();
        services.AddScoped<IProductCatalogSyncService, ProductCatalogSyncService>();

        services.AddDbContext<NexusAiDbContext>((serviceProvider, options) =>
        {
            var connectionString = configuration.GetConnectionString("Database");
            options.UseNpgsql(connectionString, npgsqlOptions => npgsqlOptions.UseVector());
        });

        services.AddControllers();
        services.AddAuthorization();
        services.Configure<ApiBehaviorOptions>(options => options.SuppressModelStateInvalidFilter = false);
        services.AddRouting(options => options.LowercaseUrls = true);
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddHealthChecks()
            .AddNpgSql(configuration.GetConnectionString("Database")!);

        services.AddScoped<IChatCompletionService>(serviceProvider =>
        {
            var kernel = serviceProvider.GetRequiredService<Kernel>();
            return kernel.GetRequiredService<IChatCompletionService>();
        });

        services.AddScoped<Kernel>(serviceProvider =>
        {
            var aiOptions = serviceProvider.GetRequiredService<IOptions<AiOptions>>().Value;
            var builder = Kernel.CreateBuilder();

            builder.Services.AddScoped(_ => serviceProvider.GetRequiredService<IFunctionInvocationFilter>());
            builder.Services.AddScoped(_ => serviceProvider.GetRequiredService<IAutoFunctionInvocationFilter>());
            builder.Services.AddScoped(_ => serviceProvider.GetRequiredService<ProductSearchPlugin>());
            builder.Services.AddScoped(_ => serviceProvider.GetRequiredService<OrderSupportPlugin>());

            builder.AddGoogleAIGeminiChatCompletion(
                modelId: aiOptions.Google.ChatModelId,
                apiKey: aiOptions.Google.ApiKey);

            builder.AddGoogleAIEmbeddingGeneration(
                modelId: aiOptions.Google.EmbeddingModelId,
                apiKey: aiOptions.Google.ApiKey,
                dimensions: aiOptions.Google.EmbeddingDimensions);

            builder.Plugins.AddFromObject(serviceProvider.GetRequiredService<ProductSearchPlugin>());
            builder.Plugins.AddFromObject(serviceProvider.GetRequiredService<OrderSupportPlugin>());

            return builder.Build();
        });

        return services;
    }
}

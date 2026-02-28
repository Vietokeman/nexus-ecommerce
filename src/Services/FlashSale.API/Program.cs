using Common.Logging;
using FlashSale.API.Persistence;
using FlashSale.API.Repositories;
using FlashSale.API.Repositories.Interfaces;
using FlashSale.API.Services;
using FlashSale.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Serilog;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "FlashSale.API")
    .WriteTo.Debug()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{NewLine}")
    .WriteTo.Elasticsearch(new Serilog.Sinks.Elasticsearch.ElasticsearchSinkOptions(
        new Uri(builder.Configuration["ElasticConfiguration:Uri"] ?? "http://localhost:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = "flashsale-api-logs-{0:yyyy.MM.dd}",
        NumberOfReplicas = 1,
        NumberOfShards = 2
    })
    .CreateLogger();

builder.Host.UseSerilog();

Log.Information("Starting FlashSale API up");

try
{
    // PostgreSQL Database
    builder.Services.AddDbContext<FlashSaleContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("DefaultConnectionString"),
            npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            }));

    // Redis (for Lua Script atomic stock management)
    builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    {
        var redisConnectionString = builder.Configuration.GetConnectionString("Redis")
            ?? "localhost:6379";
        return ConnectionMultiplexer.Connect(redisConnectionString);
    });

    // Repositories
    builder.Services.AddScoped<IFlashSaleRepository, FlashSaleRepository>();

    // Services
    builder.Services.AddSingleton<RedisStockService>();
    builder.Services.AddScoped<IFlashSaleService, FlashSaleService>();

    // CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("CorsPolicy", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    // Health Checks
    builder.Services.AddHealthChecks()
        .AddNpgSql(
            builder.Configuration.GetConnectionString("DefaultConnectionString")!,
            name: "postgresql",
            tags: new[] { "db", "postgresql" });

    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        });
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    var app = builder.Build();

    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseCors("CorsPolicy");
    app.UseSerilogRequestLogging();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHealthChecks("/health");

    // Auto-migrate
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<FlashSaleContext>();
        // Use EnsureCreatedAsync since no EF migrations exist yet
        await db.Database.EnsureCreatedAsync();
    }

    app.Run();
}
catch (Exception ex)
{
    string type = ex.GetType().Name;
    if (type.Equals("StopTheHostException", StringComparison.Ordinal))
    {
        throw;
    }
    Log.Fatal(ex, "Application failed to start correctly");
}
finally
{
    Log.Information("Shut down FlashSale API complete");
    Log.CloseAndFlush();
}

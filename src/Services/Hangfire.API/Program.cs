using Hangfire;
using Hangfire.PostgreSql;
using Hangfire.API.Services;
using Hangfire.API.Services.Interfaces;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "Hangfire.API")
    .WriteTo.Debug()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{NewLine}")
    .WriteTo.Elasticsearch(new Serilog.Sinks.Elasticsearch.ElasticsearchSinkOptions(
        new Uri(builder.Configuration["ElasticConfiguration:Uri"] ?? "http://localhost:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = "hangfire-api-logs-{0:yyyy.MM.dd}",
        NumberOfReplicas = 1,
        NumberOfShards = 2
    })
    .CreateLogger();

builder.Host.UseSerilog();

Log.Information("Starting Hangfire API up");

try
{
    // Hangfire Configuration - PostgreSQL
    var hangfireConnectionString = builder.Configuration.GetConnectionString("HangfireConnection")
        ?? "Host=nexusdb;Port=5432;Database=HangfireDb;Username=admin;Password=change_me_with_postgres_password";

    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(options =>
            options.UseNpgsqlConnection(hangfireConnectionString)));

    builder.Services.AddHangfireServer(options =>
    {
        options.WorkerCount = Environment.ProcessorCount * 2;
    });

    // Services
    builder.Services.AddScoped<IScheduledEmailService, ScheduledEmailService>();
    builder.Services.AddScoped<IAbandonedCartService, AbandonedCartService>();

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
        .AddHangfire(options =>
        {
            options.MinimumAvailableServers = 1;
        }, name: "hangfire", tags: new[] { "hangfire" });

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    var app = builder.Build();

    // Configure the HTTP request pipeline
    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseCors("CorsPolicy");

    // Hangfire Dashboard
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        DashboardTitle = "Distributed E-Commerce - Background Jobs",
        IsReadOnlyFunc = _ => false
    });

    app.UseAuthorization();
    app.MapControllers();
    app.MapHealthChecks("/health");

    // Register recurring jobs
    RecurringJob.AddOrUpdate<IAbandonedCartService>(
        "abandoned-cart-reminder",
        service => service.CheckAbandonedCartsAsync(),
        Cron.Hourly); // Run every hour

    RecurringJob.AddOrUpdate<IAbandonedCartService>(
        "cleanup-expired-baskets",
        service => service.CleanupExpiredBasketsAsync(),
        Cron.Daily); // Run daily

    Log.Information("Hangfire API started successfully. Dashboard at /hangfire");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Hangfire API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

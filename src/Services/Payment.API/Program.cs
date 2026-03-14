using Common.Logging;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Audit;
using Payment.API.Configuration;
using Payment.API.Persistence;
using Payment.API.Repositories;
using Payment.API.Repositories.Interfaces;
using Payment.API.Services;
using Payment.API.Services.Interfaces;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "Payment.API")
    .WriteTo.Debug()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{NewLine}")
    .WriteTo.Elasticsearch(new Serilog.Sinks.Elasticsearch.ElasticsearchSinkOptions(
        new Uri(builder.Configuration["ElasticConfiguration:Uri"] ?? "http://localhost:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = "payment-api-logs-{0:yyyy.MM.dd}",
        NumberOfReplicas = 1,
        NumberOfShards = 2
    })
    .CreateLogger();

builder.Host.UseSerilog();

Log.Information("Starting Payment API up");

try
{
    builder.Services.AddAuditLogging(builder.Configuration, "payment-api");

    // Database
    builder.Services.AddDbContext<PaymentDbContext>((sp, options) =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("DefaultConnectionString"),
            npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            })
            .AddInterceptors(sp.GetRequiredService<AuditSaveChangesInterceptor>()));

    // PayOS Settings
    builder.Services.Configure<PayOSSettings>(builder.Configuration.GetSection("PayOS"));

    // Repositories
    builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();

    // Services
    builder.Services.AddScoped<IPaymentService, PaymentService>();

    // MassTransit (RabbitMQ)
    builder.Services.AddMassTransit(x =>
    {
        x.UsingRabbitMq((context, cfg) =>
        {
            cfg.Host(builder.Configuration["EventBusSettings:HostAddress"] ?? "amqp://guest:guest@localhost:5672");
            cfg.ConfigureEndpoints(context);
        });
    });

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

    builder.Services.AddControllers();
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
        var db = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
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
    Log.Information("Shut down Payment API complete");
    Log.CloseAndFlush();
}

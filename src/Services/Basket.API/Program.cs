using Basket.API.Extensions;
using Common.Logging;
using Product.API.Extensions;
using Serilog;


var builder = WebApplication.CreateBuilder(args);

// Configure Serilog for logging


try
{

    // Use serilog cho full project
    //ctx host builder context
    //lc: logger configuration
    //builder.Host.UseSerilog((ctx, lc) => lc
    //    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{NewLine}")
    //    .Enrich.FromLogContext()
    //    .ReadFrom.Configuration(ctx.Configuration)
    //);
    builder.Host.UseSerilog(Serilogger.Configure);

    builder.Host.AddAppConfigurations();
    Log.Information("Starting Basket API up");

    builder.Services.ConfigureServices();
    builder.Services.ConfigureRedis(builder.Configuration);
    builder.Services.ConfigureMassTransit(builder.Configuration); // Add MassTransit with RabbitMQ
    
    // Health Checks
    builder.Services.AddHealthChecks()
        .AddRedis(
            builder.Configuration["CacheSettings:ConnectionString"] ?? "localhost:6379",
            name: "redis",
            tags: new[] { "cache", "redis" });

    // Add services
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    var app = builder.Build();

    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseHttpsRedirection();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHealthChecks("/health");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start correctly");
}
finally
{
    Log.Information("Shut down Basket API complete");
    Log.CloseAndFlush(); // ghi lai log
}

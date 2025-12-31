using Common.Logging;
using Contracts.Common.Interfaces;
using Contracts.Messages;
using Infrastructure.Common;
using Infrastructure.Messages;
using Ordering.API.Extensions;
using Ordering.Application;
using Ordering.Infrastructure;
using Ordering.Infrastructure.Persistence;
using Serilog;


var builder = WebApplication.CreateBuilder(args);

// Configure Serilog for logging
builder.Host.UseSerilog(Serilogger.Configure);

Log.Information("Starting Ordering API up");

try
{

    // Use serilog cho full project
    //ctx host builder context
    //lc: logger configuration
    //builder.Host.UseSerilog((ctx, lc) => lc
    //    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}{NewLine}{Message: lj}{NewLine}{Exception}{NewLine}")
    //    .Enrich.FromLogContext()
    //    .ReadFrom.Configuration(ctx.Configuration)
    //);
    // Add services
    builder.Services.AddInfastructureServices(builder.Configuration);
    builder.Services.AddApplicationServices();

    // Configure MassTransit with RabbitMQ for consuming events
    builder.Services.ConfigureMassTransit(builder.Configuration);
    
    // Register AutoMapper for EventBus mapping
    builder.Services.AddAutoMapper(typeof(Program).Assembly);
    
    // test transmit message (legacy - can be removed later)
    builder.Services.AddScoped<IMessageProducer, RabbitMQProducer>();// dang ki dich vu message producer
    builder.Services.AddScoped<ISerializeService, SeriallizeService>();// dang ki dich vu serialize

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    //Initialise and seed database
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<Serilog.ILogger>();
        var orderContextSeed = services.GetRequiredService<OrderContextSeed>();
        await orderContextSeed.InitialiseAsync();
        await orderContextSeed.SeedAsync();
    }

    app.UseHttpsRedirection();
    app.UseAuthorization();
    app.MapControllers();
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start correctly");
}
finally
{
    Log.Information("Shut down Ordering API complete");
    Log.CloseAndFlush(); // ghi lai log
}

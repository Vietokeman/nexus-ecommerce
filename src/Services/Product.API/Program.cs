using Common.Logging;
using Product.API.Extensions;
using Serilog;


var builder = WebApplication.CreateBuilder(args);

// Configure Serilog for logging

Log.Information("Starting Product API up");

try
{
    builder.Host.UseSerilog(Serilogger.Configure);

    builder.Host.AddAppConfigurations(); // Configure host settings

    builder.Services.AddInfrastructure(); // Add infrastructure services

    var app = builder.Build();

    app.UseInfrastructure(); // Use infrastructure middleware
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start correctly");
}
finally
{
    Log.Information("Shut down Product API complete");
    Log.CloseAndFlush(); // ghi lai log
}

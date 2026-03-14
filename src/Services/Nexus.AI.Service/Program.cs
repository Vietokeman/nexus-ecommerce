using Common.Logging;
using Nexus.AI.Service.Extensions;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Information("Starting Nexus AI Service up");

try
{
    builder.Host.UseSerilog(Serilogger.Configure);
    builder.Host.AddAppConfigurations();

    builder.Services.AddInfrastructure(builder.Configuration);

    var app = builder.Build();

    app.UseInfrastructure();
    app.MigrateDatabase().Run();
}
catch (Exception ex)
{
    var type = ex.GetType().Name;
    if (type.Equals("StopTheHostException", StringComparison.Ordinal))
    {
        throw;
    }

    Log.Fatal(ex, "Application failed to start correctly");
}
finally
{
    Log.Information("Shut down Nexus AI Service complete");
    Log.CloseAndFlush();
}

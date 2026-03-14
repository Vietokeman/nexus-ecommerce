using Common.Logging;
using Seller.API.Extensions;
using Seller.API.Persistence;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Information("Starting Seller API up");

try
{
    builder.Host.UseSerilog(Serilogger.Configure);

    builder.Host.AddAppConfigurations();

    builder.Services.AddInfrastructure(builder.Configuration);

    var app = builder.Build();

    app.UseInfrastructure();

    app.MigrateDatabase<SellerContext>((context, _) =>
    {
        SellerContextSeed.SeedSellerAsync(context, Log.Logger).Wait();
    })
        .Run();
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
    Log.Information("Shut down Seller API complete");
    Log.CloseAndFlush();
}

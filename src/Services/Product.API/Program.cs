using Common.Logging;
using Product.API.Extensions;
using Product.API.Persistence;
using Serilog;


var builder = WebApplication.CreateBuilder(args);

// Configure Serilog for logging

Log.Information("Starting Product API up");

try
{
    builder.Host.UseSerilog(Serilogger.Configure);

    builder.Host.AddAppConfigurations(); // Configure host settings

    builder.Services.AddInfrastructure(builder.Configuration); // Add infrastructure services

    var app = builder.Build();

    app.UseInfrastructure(); // Use infrastructure middleware

    //app.migrateDatabase
    app.MigrateDatabase<ProductContext>((context, _) => // khong dung IServiceProvider o day nen dung dau _ de hien thi k can tham so 
    {
        ProductContextSeed.SeedProductAsync(context, Log.Logger).Wait(); // Seed the database
    })
        .Run();// auto update database
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
    Log.Information("Shut down Product API complete");
    Log.CloseAndFlush(); // ghi lai log
}

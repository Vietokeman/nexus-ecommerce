using Common.Logging;
using Inventory.API.Configurations;
using Inventory.API.GrpcServices;
using Inventory.API.Repositories;
using Inventory.API.Repositories.Interfaces;
using Inventory.API.Services;
using Inventory.API.Services.Interfaces;
using Serilog;


var builder = WebApplication.CreateBuilder(args);

// Configure Serilog for logging
builder.Host.UseSerilog(Serilogger.Configure);

Log.Information("Starting Inventory API up");

try
{
    // Configure MongoDB
    builder.Services.Configure<MongoDbSettings>(
        builder.Configuration.GetSection(MongoDbSettings.SectionName));
    
    // Register repositories and services
    builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
    builder.Services.AddScoped<IInventoryService, InventoryService>();
    
    // Add gRPC services
    builder.Services.AddGrpc();

    // Add API services
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new() { Title = "Inventory.API", Version = "v1" });
    });

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // Map gRPC service endpoint
    app.MapGrpcService<StockGrpcService>();
    
    // Enable gRPC-Web (optional, for browser clients)
    app.MapGet("/", () => "Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");

    app.UseHttpsRedirection();
    app.UseAuthorization();
    app.MapControllers();
    
    Log.Information("Inventory API started successfully");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start correctly");
}
finally
{
    Log.Information("Shut down Inventory API complete");
    Log.CloseAndFlush(); // ghi lai log
}

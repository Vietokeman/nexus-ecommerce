using Common.Logging;
using Contracts.Common.Interfaces;
using Customer.API.Controllers;
using Customer.API.Persistence;
using Customer.API.Repositories;
using Customer.API.Repositories.Interfaces;
using Customer.API.Services;
using Customer.API.Services.Interfaces;
using Infrastructure.Common;
using Microsoft.EntityFrameworkCore;
using Serilog;
var builder = WebApplication.CreateBuilder(args);

// Configure Serilog for logging
builder.Host.UseSerilog(Serilogger.Configure);

Log.Information("Starting Customer API up");

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

    // Add services
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnectionString");
    builder.Services.AddDbContext<CustomerContext>(options =>
        options.UseNpgsql(connectionString));

    builder.Services.AddScoped<ICustomerRepository, CustomerRepositoryAsync>()
        .AddScoped(typeof(IRepositoryBaseAsync<,,>), typeof(RepositoryBaseAsync<,,>))
        .AddScoped(typeof(IUnitOfWork<>), typeof(UnitOfWork<>))
        .AddScoped<ICustomerService, CustomerService>();
    var app = builder.Build();
    app.MapCustomerEndpoints();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Customer Minimal API V1");
        });
    }

    //app.UseHttpsRedirection();
    app.UseAuthorization();
    app.MapControllers();
    await app.SeedCustomerData();
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
    Log.Information("Shut down Customer API complete");
    Log.CloseAndFlush(); // ghi lai log
}

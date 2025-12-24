using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Ocelot.Cache.CacheManager;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithProperty("Application", "OcelotApiGateway")
    .WriteTo.Debug()
    .WriteTo.Console()
    .WriteTo.Elasticsearch(new Serilog.Sinks.Elasticsearch.ElasticsearchSinkOptions(new Uri(builder.Configuration["ElasticConfiguration:Uri"] ?? "http://localhost:9200"))
    {
        AutoRegisterTemplate = true,
        IndexFormat = "ocelot-gateway-logs-{0:yyyy.MM.dd}",
        NumberOfReplicas = 1,
        NumberOfShards = 2
    })
    .CreateLogger();

builder.Host.UseSerilog();

// Add Ocelot configuration
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// Add services to the container
builder.Services.AddOcelot(builder.Configuration)
    .AddCacheManager(x => x.WithDictionaryHandle());

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseCors("CorsPolicy");

app.UseSerilogRequestLogging();

await app.UseOcelot();

app.Run();

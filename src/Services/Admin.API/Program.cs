using Admin.API.Hubs;
using Admin.API.Services;
using Admin.API.Stores;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<AdminDataStore>();
builder.Services.AddSignalR();
builder.Services.AddSingleton<INotificationService, NotificationService>();
builder.Services.AddHttpClient("admin-elasticsearch", (sp, client) =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    var elasticUri = configuration["ElasticConfiguration:Uri"] ?? "http://localhost:9200";
    client.BaseAddress = new Uri(elasticUri);
    client.Timeout = TimeSpan.FromSeconds(15);
});
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("admin-ui", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseRouting();
app.UseCors("admin-ui");
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "admin.api" }));

app.Run();

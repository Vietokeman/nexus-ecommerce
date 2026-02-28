var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecksUI(opt =>
{
    opt.SetEvaluationTimeInSeconds(30);
    opt.MaximumHistoryEntriesPerEndpoint(60);

    opt.AddHealthCheckEndpoint("Product API", "http://product.api:80/health");
    opt.AddHealthCheckEndpoint("Customer API", "http://customer.api:80/health");
    opt.AddHealthCheckEndpoint("Basket API", "http://basket.api:80/health");
    opt.AddHealthCheckEndpoint("Ordering API", "http://ordering.api:80/health");
    opt.AddHealthCheckEndpoint("Inventory API", "http://inventory.api:80/health");
    opt.AddHealthCheckEndpoint("Payment API", "http://payment.api:80/health");
    opt.AddHealthCheckEndpoint("Identity API", "http://identity.api:80/health");
    opt.AddHealthCheckEndpoint("Hangfire API", "http://hangfire.api:80/health");
    opt.AddHealthCheckEndpoint("Ocelot Gateway", "http://ocelot.apigw:80/health");
    opt.AddHealthCheckEndpoint("FlashSale API", "http://flashsale.api:80/health");
    opt.AddHealthCheckEndpoint("GroupBuy API", "http://groupbuy.api:80/health");
}).AddInMemoryStorage();

var app = builder.Build();

app.MapHealthChecksUI(options =>
{
    options.UIPath = "/healthcheck-dashboard";
});

app.MapGet("/", () => Results.Redirect("/healthcheck-dashboard"));

app.Run();

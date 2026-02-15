using Hangfire.API.Services.Interfaces;

namespace Hangfire.API.Services;

/// <summary>
/// Checks for abandoned carts and sends reminder emails.
/// Connects to Basket.API (Redis) via HTTP to get stale baskets.
/// </summary>
public class AbandonedCartService : IAbandonedCartService
{
    private readonly IScheduledEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AbandonedCartService> _logger;

    public AbandonedCartService(
        IScheduledEmailService emailService,
        IConfiguration configuration,
        ILogger<AbandonedCartService> logger)
    {
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Recurring job: scans for baskets not checked out within 24h.
    /// In a real system this would query Basket.API or a shared DB.
    /// For now, logs the check since Redis doesn't track timestamps natively.
    /// </summary>
    public async Task CheckAbandonedCartsAsync()
    {
        _logger.LogInformation("[AbandonedCartJob] Checking for abandoned carts at {Time}", DateTime.UtcNow);

        try
        {
            // In production, you would:
            // 1. Query a separate "BasketActivity" table that tracks last-updated timestamps
            // 2. Find baskets older than 24 hours that haven't been checked out
            // 3. Get customer email from Customer.API
            // 4. Send reminder email
            //
            // Example flow:
            // var gatewayUrl = _configuration["GatewayUrl"] ?? "http://ocelot.apigw:80";
            // var httpClient = new HttpClient { BaseAddress = new Uri(gatewayUrl) };
            // var baskets = await httpClient.GetFromJsonAsync<List<BasketInfo>>("/api/baskets/abandoned");
            // foreach (var basket in baskets)
            // {
            //     await _emailService.SendAbandonedCartEmailAsync(basket.Email, basket.UserName, basket.ItemCount);
            // }

            _logger.LogInformation("[AbandonedCartJob] Abandoned cart check completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AbandonedCartJob] Error checking abandoned carts");
            throw;
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// Daily job: cleans up expired baskets from Redis
    /// </summary>
    public async Task CleanupExpiredBasketsAsync()
    {
        _logger.LogInformation("[CleanupJob] Cleaning up expired baskets at {Time}", DateTime.UtcNow);

        try
        {
            // In production:
            // 1. Query baskets older than 7 days
            // 2. Delete them via Basket.API
            // var gatewayUrl = _configuration["GatewayUrl"] ?? "http://ocelot.apigw:80";
            // var httpClient = new HttpClient { BaseAddress = new Uri(gatewayUrl) };
            // await httpClient.DeleteAsync("/api/baskets/expired");

            _logger.LogInformation("[CleanupJob] Expired basket cleanup completed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[CleanupJob] Error cleaning up expired baskets");
            throw;
        }

        await Task.CompletedTask;
    }
}

namespace Hangfire.API.Services.Interfaces;

/// <summary>
/// Service for checking and handling abandoned carts
/// </summary>
public interface IAbandonedCartService
{
    Task CheckAbandonedCartsAsync();
    Task CleanupExpiredBasketsAsync();
}

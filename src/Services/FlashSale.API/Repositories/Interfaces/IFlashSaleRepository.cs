using FlashSale.API.Entities;

namespace FlashSale.API.Repositories.Interfaces;

public interface IFlashSaleRepository
{
    // Sessions
    Task<IEnumerable<FlashSaleSession>> GetAllSessionsAsync();
    Task<FlashSaleSession?> GetSessionByIdAsync(long id);
    Task<IEnumerable<FlashSaleSession>> GetActiveSessionsAsync();
    Task<FlashSaleSession> CreateSessionAsync(FlashSaleSession session);
    Task UpdateSessionAsync(FlashSaleSession session);

    // Items
    Task<FlashSaleItem?> GetItemByIdAsync(long id);
    Task<IEnumerable<FlashSaleItem>> GetItemsBySessionIdAsync(long sessionId);
    Task<FlashSaleItem> CreateItemAsync(FlashSaleItem item);
    Task UpdateItemAsync(FlashSaleItem item);

    // Orders
    Task<FlashSaleOrder> CreateOrderAsync(FlashSaleOrder order);
    Task<int> GetUserPurchaseCountAsync(long itemId, string userName);
    Task<IEnumerable<FlashSaleOrder>> GetOrdersByUserAsync(string userName);
}

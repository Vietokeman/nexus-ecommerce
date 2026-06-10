using FlashSale.API.Entities;
using Shared.SeedWork;

namespace FlashSale.API.Repositories.Interfaces;

public interface IFlashSaleRepository
{
    // Sessions
    Task<IEnumerable<FlashSaleSession>> GetAllSessionsAsync();
    Task<PagedList<FlashSaleSession>> GetPagedSessionsAsync(PagingRequestParameters requestParameters);
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
    Task<PagedList<FlashSaleOrder>> GetPagedOrdersByUserAsync(string userName, PagingRequestParameters requestParameters);
}

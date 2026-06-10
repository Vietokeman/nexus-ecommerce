using FlashSale.API.Entities;
using Shared.SeedWork;

namespace FlashSale.API.Services.Interfaces;

public interface IFlashSaleService
{
    // Sessions
    Task<IEnumerable<FlashSaleSession>> GetAllSessionsAsync();
    Task<PagedList<FlashSaleSession>> GetPagedSessionsAsync(PagingRequestParameters requestParameters);
    Task<FlashSaleSession?> GetSessionByIdAsync(long id);
    Task<IEnumerable<FlashSaleSession>> GetActiveSessionsAsync();
    Task<FlashSaleSession> CreateSessionAsync(FlashSaleSession session);
    Task ActivateSessionAsync(long sessionId);
    Task EndSessionAsync(long sessionId);

    // Purchase flow (Redis Lua Script + PostgreSQL)
    Task<FlashSaleOrder> PurchaseAsync(long itemId, string userName, int quantity);
    Task<int> GetRemainingStockAsync(long itemId);
    Task<IEnumerable<FlashSaleOrder>> GetUserOrdersAsync(string userName);
    Task<PagedList<FlashSaleOrder>> GetPagedUserOrdersAsync(string userName, PagingRequestParameters requestParameters);
}

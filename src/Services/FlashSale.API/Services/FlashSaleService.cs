using FlashSale.API.Entities;
using FlashSale.API.Repositories.Interfaces;
using FlashSale.API.Services.Interfaces;

namespace FlashSale.API.Services;

public class FlashSaleService : IFlashSaleService
{
    private readonly IFlashSaleRepository _repository;
    private readonly RedisStockService _redisStock;
    private readonly ILogger<FlashSaleService> _logger;

    public FlashSaleService(
        IFlashSaleRepository repository,
        RedisStockService redisStock,
        ILogger<FlashSaleService> logger)
    {
        _repository = repository;
        _redisStock = redisStock;
        _logger = logger;
    }

    public async Task<IEnumerable<FlashSaleSession>> GetAllSessionsAsync()
        => await _repository.GetAllSessionsAsync();

    public async Task<FlashSaleSession?> GetSessionByIdAsync(long id)
        => await _repository.GetSessionByIdAsync(id);

    public async Task<IEnumerable<FlashSaleSession>> GetActiveSessionsAsync()
        => await _repository.GetActiveSessionsAsync();

    public async Task<FlashSaleSession> CreateSessionAsync(FlashSaleSession session)
        => await _repository.CreateSessionAsync(session);

    /// <summary>
    /// Activate a session: set status to Active and pre-load all item stocks into Redis.
    /// </summary>
    public async Task ActivateSessionAsync(long sessionId)
    {
        var session = await _repository.GetSessionByIdAsync(sessionId)
            ?? throw new KeyNotFoundException($"Session {sessionId} not found");

        session.Status = "Active";
        await _repository.UpdateSessionAsync(session);

        // Pre-load stock into Redis for each item
        var ttl = session.EndTime - DateTime.UtcNow;
        if (ttl <= TimeSpan.Zero) ttl = TimeSpan.FromHours(1);

        foreach (var item in session.Items)
        {
            var availableStock = item.TotalStock - item.SoldQuantity;
            await _redisStock.InitializeStockAsync(item.Id, availableStock, ttl);
        }

        _logger.LogInformation(
            "Flash sale session {SessionId} activated with {ItemCount} items",
            sessionId, session.Items.Count);
    }

    /// <summary>
    /// End a session: sync Redis sold quantities back to PostgreSQL.
    /// </summary>
    public async Task EndSessionAsync(long sessionId)
    {
        var session = await _repository.GetSessionByIdAsync(sessionId)
            ?? throw new KeyNotFoundException($"Session {sessionId} not found");

        session.Status = "Ended";

        // Sync remaining stock from Redis back to PostgreSQL
        foreach (var item in session.Items)
        {
            var remaining = await _redisStock.GetRemainingStockAsync(item.Id);
            item.SoldQuantity = item.TotalStock - remaining;
            await _repository.UpdateItemAsync(item);
        }

        await _repository.UpdateSessionAsync(session);

        _logger.LogInformation("Flash sale session {SessionId} ended", sessionId);
    }

    /// <summary>
    /// Core purchase flow:
    /// 1. Validate session is active
    /// 2. Atomic Redis Lua Script: check user limit + deduct stock
    /// 3. Persist order to PostgreSQL
    /// 4. If DB write fails, rollback Redis stock
    /// </summary>
    public async Task<FlashSaleOrder> PurchaseAsync(long itemId, string userName, int quantity)
    {
        var item = await _repository.GetItemByIdAsync(itemId)
            ?? throw new KeyNotFoundException($"Flash sale item {itemId} not found");

        // Validate session is active
        if (item.Session.Status != "Active")
            throw new InvalidOperationException("Flash sale session is not active");

        if (DateTime.UtcNow < item.Session.StartTime || DateTime.UtcNow > item.Session.EndTime)
            throw new InvalidOperationException("Flash sale session is not within the active time window");

        // Atomic Redis deduction (Lua Script)
        var result = await _redisStock.TryDeductStockAsync(itemId, userName, quantity, item.MaxPerUser);

        switch (result)
        {
            case -1:
                throw new InvalidOperationException("Out of stock — sold out!");
            case -2:
                throw new InvalidOperationException($"Purchase limit exceeded (max {item.MaxPerUser} per user)");
        }

        try
        {
            // Persist order to PostgreSQL
            var order = new FlashSaleOrder
            {
                ItemId = itemId,
                UserName = userName,
                Quantity = quantity,
                UnitPrice = item.FlashPrice,
                Status = "Confirmed"
            };

            return await _repository.CreateOrderAsync(order);
        }
        catch (Exception ex)
        {
            // Rollback Redis stock on DB failure
            _logger.LogError(ex, "Failed to persist flash sale order, rolling back Redis stock");
            await _redisStock.RollbackStockAsync(itemId, userName, quantity);
            throw;
        }
    }

    public async Task<int> GetRemainingStockAsync(long itemId)
        => await _redisStock.GetRemainingStockAsync(itemId);

    public async Task<IEnumerable<FlashSaleOrder>> GetUserOrdersAsync(string userName)
        => await _repository.GetOrdersByUserAsync(userName);
}

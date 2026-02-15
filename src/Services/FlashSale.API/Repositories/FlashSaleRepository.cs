using FlashSale.API.Entities;
using FlashSale.API.Persistence;
using FlashSale.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FlashSale.API.Repositories;

public class FlashSaleRepository : IFlashSaleRepository
{
    private readonly FlashSaleContext _context;

    public FlashSaleRepository(FlashSaleContext context)
    {
        _context = context;
    }

    // Sessions
    public async Task<IEnumerable<FlashSaleSession>> GetAllSessionsAsync()
        => await _context.FlashSaleSessions
            .Include(s => s.Items)
            .OrderByDescending(s => s.StartTime)
            .ToListAsync();

    public async Task<FlashSaleSession?> GetSessionByIdAsync(long id)
        => await _context.FlashSaleSessions
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<FlashSaleSession>> GetActiveSessionsAsync()
    {
        var now = DateTime.UtcNow;
        return await _context.FlashSaleSessions
            .Include(s => s.Items)
            .Where(s => s.Status == "Active" && s.StartTime <= now && s.EndTime >= now)
            .ToListAsync();
    }

    public async Task<FlashSaleSession> CreateSessionAsync(FlashSaleSession session)
    {
        await _context.FlashSaleSessions.AddAsync(session);
        await _context.SaveChangesAsync();
        return session;
    }

    public async Task UpdateSessionAsync(FlashSaleSession session)
    {
        session.UpdatedAt = DateTime.UtcNow;
        _context.FlashSaleSessions.Update(session);
        await _context.SaveChangesAsync();
    }

    // Items
    public async Task<FlashSaleItem?> GetItemByIdAsync(long id)
        => await _context.FlashSaleItems
            .Include(i => i.Session)
            .FirstOrDefaultAsync(i => i.Id == id);

    public async Task<IEnumerable<FlashSaleItem>> GetItemsBySessionIdAsync(long sessionId)
        => await _context.FlashSaleItems
            .Where(i => i.SessionId == sessionId)
            .ToListAsync();

    public async Task<FlashSaleItem> CreateItemAsync(FlashSaleItem item)
    {
        await _context.FlashSaleItems.AddAsync(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task UpdateItemAsync(FlashSaleItem item)
    {
        _context.FlashSaleItems.Update(item);
        await _context.SaveChangesAsync();
    }

    // Orders
    public async Task<FlashSaleOrder> CreateOrderAsync(FlashSaleOrder order)
    {
        await _context.FlashSaleOrders.AddAsync(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<int> GetUserPurchaseCountAsync(long itemId, string userName)
        => await _context.FlashSaleOrders
            .Where(o => o.ItemId == itemId && o.UserName == userName && o.Status != "Cancelled")
            .SumAsync(o => o.Quantity);

    public async Task<IEnumerable<FlashSaleOrder>> GetOrdersByUserAsync(string userName)
        => await _context.FlashSaleOrders
            .Include(o => o.Item)
            .Where(o => o.UserName == userName)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
}

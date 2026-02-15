using Inventory.API.Entities;
using Inventory.API.Persistence;
using Inventory.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Shared.SeedWork;

namespace Inventory.API.Repositories
{
    /// <summary>
    /// PostgreSQL EF Core repository implementation for Inventory
    /// (migrated from MongoDB driver)
    /// </summary>
    public class InventoryRepository : IInventoryRepository
    {
        private readonly InventoryContext _context;
        private readonly ILogger<InventoryRepository> _logger;

        public InventoryRepository(
            InventoryContext context,
            ILogger<InventoryRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<InventoryEntry>> GetAllAsync()
        {
            return await _context.InventoryEntries
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        public async Task<PagedList<InventoryEntry>> GetPagedAsync(int pageNumber, int pageSize)
        {
            var totalCount = await _context.InventoryEntries.CountAsync();
            
            var items = await _context.InventoryEntries
                .OrderByDescending(x => x.CreatedDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedList<InventoryEntry>(items, totalCount, pageNumber, pageSize);
        }

        public async Task<InventoryEntry?> GetByIdAsync(long id)
        {
            return await _context.InventoryEntries.FindAsync(id);
        }

        public async Task<IEnumerable<InventoryEntry>> GetByItemNoAsync(string itemNo)
        {
            return await _context.InventoryEntries
                .Where(x => x.ItemNo == itemNo)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<InventoryEntry>> GetByDocumentNoAsync(string documentNo)
        {
            return await _context.InventoryEntries
                .Where(x => x.DocumentNo == documentNo)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        public async Task CreateAsync(InventoryEntry entry)
        {
            await _context.InventoryEntries.AddAsync(entry);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Inventory entry created: {DocumentNo} - {ItemNo} - Qty: {Quantity}", 
                entry.DocumentNo, entry.ItemNo, entry.Quantity);
        }

        public async Task CreateManyAsync(IEnumerable<InventoryEntry> entries)
        {
            await _context.InventoryEntries.AddRangeAsync(entries);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Inserted {Count} inventory entries", entries.Count());
        }

        public async Task<bool> UpdateAsync(InventoryEntry entry)
        {
            _context.InventoryEntries.Update(entry);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var entry = await _context.InventoryEntries.FindAsync(id);
            if (entry == null) return false;
            _context.InventoryEntries.Remove(entry);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        /// <summary>
        /// Get current stock quantity for an item using PostgreSQL SUM aggregation
        /// </summary>
        public async Task<int> GetStockQuantityAsync(string itemNo)
        {
            return await _context.InventoryEntries
                .Where(x => x.ItemNo == itemNo)
                .SumAsync(x => x.Quantity);
        }

        /// <summary>
        /// Get stock quantities for multiple items in one query (optimized GroupBy)
        /// </summary>
        public async Task<Dictionary<string, int>> GetStockQuantitiesAsync(IEnumerable<string> itemNos)
        {
            var itemNoList = itemNos.ToList();
            return await _context.InventoryEntries
                .Where(x => itemNoList.Contains(x.ItemNo))
                .GroupBy(x => x.ItemNo)
                .Select(g => new { ItemNo = g.Key, TotalQuantity = g.Sum(x => x.Quantity) })
                .ToDictionaryAsync(x => x.ItemNo, x => x.TotalQuantity);
        }
    }
}

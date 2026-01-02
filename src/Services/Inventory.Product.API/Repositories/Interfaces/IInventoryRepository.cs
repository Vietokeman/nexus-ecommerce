using Inventory.API.Entities;
using Shared.SeedWork;

namespace Inventory.API.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for Inventory operations
    /// </summary>
    public interface IInventoryRepository
    {
        // CRUD Operations
        Task<IEnumerable<InventoryEntry>> GetAllAsync();
        Task<PagedList<InventoryEntry>> GetPagedAsync(int pageNumber, int pageSize);
        Task<InventoryEntry?> GetByIdAsync(string id);
        Task<IEnumerable<InventoryEntry>> GetByItemNoAsync(string itemNo);
        Task CreateAsync(InventoryEntry entry);
        Task CreateManyAsync(IEnumerable<InventoryEntry> entries);
        Task<bool> UpdateAsync(InventoryEntry entry);
        Task<bool> DeleteAsync(string id);
        
        // Business Operations
        Task<int> GetStockQuantityAsync(string itemNo);
        Task<IEnumerable<InventoryEntry>> GetByDocumentNoAsync(string documentNo);
        Task<Dictionary<string, int>> GetStockQuantitiesAsync(IEnumerable<string> itemNos);
    }
}

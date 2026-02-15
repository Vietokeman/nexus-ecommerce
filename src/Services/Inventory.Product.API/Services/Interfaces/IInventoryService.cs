using Inventory.API.DTOs;
using Inventory.API.Entities;
using Shared.SeedWork;

namespace Inventory.API.Services.Interfaces
{
    /// <summary>
    /// Service interface for Inventory business logic
    /// </summary>
    public interface IInventoryService
    {
        // Query Operations
        Task<IEnumerable<InventoryEntry>> GetAllEntriesAsync();
        Task<PagedList<InventoryEntry>> GetPagedEntriesAsync(int pageNumber, int pageSize);
        Task<InventoryEntry?> GetEntryByIdAsync(long id);
        Task<IEnumerable<InventoryEntry>> GetEntriesByItemAsync(string itemNo);
        Task<IEnumerable<InventoryEntry>> GetEntriesByDocumentAsync(string documentNo);
        
        // Stock Operations
        Task<StockDto> GetStockByItemAsync(string itemNo);
        Task<IEnumerable<StockDto>> GetStockByItemsAsync(IEnumerable<string> itemNos);
        
        // Transaction Operations
        Task<long> CreatePurchaseOrderAsync(PurchaseOrderDto dto);
        Task<long> CreateSalesOrderAsync(SalesOrderDto dto);
        Task<long> CreateInventoryEntryAsync(InventoryEntryDto dto);
        Task<bool> DeleteEntryAsync(long id);
    }
}

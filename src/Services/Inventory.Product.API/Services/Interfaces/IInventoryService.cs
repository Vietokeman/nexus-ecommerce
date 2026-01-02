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
        Task<InventoryEntry?> GetEntryByIdAsync(string id);
        Task<IEnumerable<InventoryEntry>> GetEntriesByItemAsync(string itemNo);
        Task<IEnumerable<InventoryEntry>> GetEntriesByDocumentAsync(string documentNo);
        
        // Stock Operations
        Task<StockDto> GetStockByItemAsync(string itemNo);
        Task<IEnumerable<StockDto>> GetStockByItemsAsync(IEnumerable<string> itemNos);
        
        // Transaction Operations
        Task<string> CreatePurchaseOrderAsync(PurchaseOrderDto dto);
        Task<string> CreateSalesOrderAsync(SalesOrderDto dto);
        Task<string> CreateInventoryEntryAsync(InventoryEntryDto dto);
        Task<bool> DeleteEntryAsync(string id);
    }
}

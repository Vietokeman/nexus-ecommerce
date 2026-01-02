using Inventory.API.DTOs;
using Inventory.API.Entities;
using Inventory.API.Repositories.Interfaces;
using Inventory.API.Services.Interfaces;
using MongoDB.Bson;
using Shared.SeedWork;

namespace Inventory.API.Services
{
    /// <summary>
    /// Service layer implementing inventory business logic
    /// Handles stock calculations and transaction management
    /// </summary>
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _repository;
        private readonly ILogger<InventoryService> _logger;

        public InventoryService(
            IInventoryRepository repository,
            ILogger<InventoryService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<InventoryEntry>> GetAllEntriesAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<PagedList<InventoryEntry>> GetPagedEntriesAsync(int pageNumber, int pageSize)
        {
            return await _repository.GetPagedAsync(pageNumber, pageSize);
        }

        public async Task<InventoryEntry?> GetEntryByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<InventoryEntry>> GetEntriesByItemAsync(string itemNo)
        {
            return await _repository.GetByItemNoAsync(itemNo);
        }

        public async Task<IEnumerable<InventoryEntry>> GetEntriesByDocumentAsync(string documentNo)
        {
            return await _repository.GetByDocumentNoAsync(documentNo);
        }

        public async Task<StockDto> GetStockByItemAsync(string itemNo)
        {
            var quantity = await _repository.GetStockQuantityAsync(itemNo);
            return new StockDto
            {
                ItemNo = itemNo,
                Quantity = quantity
            };
        }

        public async Task<IEnumerable<StockDto>> GetStockByItemsAsync(IEnumerable<string> itemNos)
        {
            var stockDict = await _repository.GetStockQuantitiesAsync(itemNos);
            
            return itemNos.Select(itemNo => new StockDto
            {
                ItemNo = itemNo,
                Quantity = stockDict.ContainsKey(itemNo) ? stockDict[itemNo] : 0
            });
        }

        public async Task<string> CreatePurchaseOrderAsync(PurchaseOrderDto dto)
        {
            _logger.LogInformation("Creating purchase order: {DocumentNo}", dto.DocumentNo);

            var entries = dto.Items.Select(item => new InventoryEntry
            {
                Id = ObjectId.GenerateNewId().ToString(),
                DocumentNo = dto.DocumentNo,
                ItemNo = item.ItemNo,
                Quantity = item.Quantity, // Positive for purchase (IN)
                DocumentType = "Purchase",
                ExternalDocumentNo = dto.DocumentNo,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = "system"
            });

            await _repository.CreateManyAsync(entries);
            
            _logger.LogInformation("Purchase order created successfully: {DocumentNo} with {Count} items", 
                dto.DocumentNo, entries.Count());
            
            return dto.DocumentNo;
        }

        public async Task<string> CreateSalesOrderAsync(SalesOrderDto dto)
        {
            _logger.LogInformation("Creating sales order: {DocumentNo}", dto.DocumentNo);

            // Validate stock availability first
            var itemNos = dto.Items.Select(x => x.ItemNo);
            var currentStocks = await _repository.GetStockQuantitiesAsync(itemNos);

            foreach (var item in dto.Items)
            {
                var availableStock = currentStocks.ContainsKey(item.ItemNo) ? currentStocks[item.ItemNo] : 0;
                if (availableStock < item.Quantity)
                {
                    _logger.LogWarning("Insufficient stock for item {ItemNo}. Available: {Available}, Requested: {Requested}",
                        item.ItemNo, availableStock, item.Quantity);
                    throw new InvalidOperationException(
                        $"Insufficient stock for item {item.ItemNo}. Available: {availableStock}, Requested: {item.Quantity}");
                }
            }

            var entries = dto.Items.Select(item => new InventoryEntry
            {
                Id = ObjectId.GenerateNewId().ToString(),
                DocumentNo = dto.DocumentNo,
                ItemNo = item.ItemNo,
                Quantity = -item.Quantity, // Negative for sales (OUT)
                DocumentType = "Sales",
                ExternalDocumentNo = dto.DocumentNo,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = "system"
            });

            await _repository.CreateManyAsync(entries);
            
            _logger.LogInformation("Sales order created successfully: {DocumentNo} with {Count} items", 
                dto.DocumentNo, entries.Count());
            
            return dto.DocumentNo;
        }

        public async Task<string> CreateInventoryEntryAsync(InventoryEntryDto dto)
        {
            var entry = new InventoryEntry
            {
                Id = ObjectId.GenerateNewId().ToString(),
                DocumentNo = dto.DocumentNo,
                ItemNo = dto.ItemNo,
                Quantity = dto.Quantity,
                DocumentType = dto.DocumentType,
                ExternalDocumentNo = dto.ExternalDocumentNo,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = "system"
            };

            await _repository.CreateAsync(entry);
            return entry.Id;
        }

        public async Task<bool> DeleteEntryAsync(string id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}

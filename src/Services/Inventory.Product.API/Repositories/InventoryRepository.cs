using Inventory.API.Configurations;
using Inventory.API.Entities;
using Inventory.API.Repositories.Interfaces;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Shared.SeedWork;

namespace Inventory.API.Repositories
{
    /// <summary>
    /// MongoDB repository implementation for Inventory
    /// Demonstrates MongoDB driver usage and aggregation
    /// </summary>
    public class InventoryRepository : IInventoryRepository
    {
        private readonly IMongoCollection<InventoryEntry> _collection;
        private readonly ILogger<InventoryRepository> _logger;

        public InventoryRepository(
            IOptions<MongoDbSettings> settings,
            ILogger<InventoryRepository> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            
            var mongoSettings = settings.Value;
            var client = new MongoClient(mongoSettings.ConnectionString);
            var database = client.GetDatabase(mongoSettings.DatabaseName);
            _collection = database.GetCollection<InventoryEntry>(mongoSettings.CollectionName);
            
            // Create indexes for performance
            CreateIndexes();
        }

        private void CreateIndexes()
        {
            try
            {
                // Index on ItemNo for fast stock queries
                var itemNoIndex = Builders<InventoryEntry>.IndexKeys.Ascending(x => x.ItemNo);
                _collection.Indexes.CreateOne(new CreateIndexModel<InventoryEntry>(itemNoIndex));

                // Index on DocumentNo for document lookup
                var docNoIndex = Builders<InventoryEntry>.IndexKeys.Ascending(x => x.DocumentNo);
                _collection.Indexes.CreateOne(new CreateIndexModel<InventoryEntry>(docNoIndex));

                // Index on CreatedDate for time-series queries
                var dateIndex = Builders<InventoryEntry>.IndexKeys.Descending(x => x.CreatedDate);
                _collection.Indexes.CreateOne(new CreateIndexModel<InventoryEntry>(dateIndex));
                
                _logger.LogInformation("MongoDB indexes created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to create indexes (might already exist)");
            }
        }

        public async Task<IEnumerable<InventoryEntry>> GetAllAsync()
        {
            return await _collection.Find(_ => true)
                .SortByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        public async Task<PagedList<InventoryEntry>> GetPagedAsync(int pageNumber, int pageSize)
        {
            var totalCount = await _collection.CountDocumentsAsync(_ => true);
            
            var items = await _collection.Find(_ => true)
                .SortByDescending(x => x.CreatedDate)
                .Skip((pageNumber - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return new PagedList<InventoryEntry>(items, (int)totalCount, pageNumber, pageSize);
        }

        public async Task<InventoryEntry?> GetByIdAsync(string id)
        {
            return await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<InventoryEntry>> GetByItemNoAsync(string itemNo)
        {
            return await _collection.Find(x => x.ItemNo == itemNo)
                .SortByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<InventoryEntry>> GetByDocumentNoAsync(string documentNo)
        {
            return await _collection.Find(x => x.DocumentNo == documentNo)
                .SortByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        public async Task CreateAsync(InventoryEntry entry)
        {
            await _collection.InsertOneAsync(entry);
            _logger.LogInformation("Inventory entry created: {DocumentNo} - {ItemNo} - Qty: {Quantity}", 
                entry.DocumentNo, entry.ItemNo, entry.Quantity);
        }

        public async Task CreateManyAsync(IEnumerable<InventoryEntry> entries)
        {
            await _collection.InsertManyAsync(entries);
            _logger.LogInformation("Inserted {Count} inventory entries", entries.Count());
        }

        public async Task<bool> UpdateAsync(InventoryEntry entry)
        {
            var result = await _collection.ReplaceOneAsync(x => x.Id == entry.Id, entry);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _collection.DeleteOneAsync(x => x.Id == id);
            return result.DeletedCount > 0;
        }

        /// <summary>
        /// Get current stock quantity for an item using MongoDB aggregation
        /// SUM all quantity changes (positive for IN, negative for OUT)
        /// </summary>
        public async Task<int> GetStockQuantityAsync(string itemNo)
        {
            var pipeline = _collection.Aggregate()
                .Match(x => x.ItemNo == itemNo)
                .Group(
                    key => key.ItemNo,
                    group => new { TotalQuantity = group.Sum(x => x.Quantity) }
                );

            var result = await pipeline.FirstOrDefaultAsync();
            return result?.TotalQuantity ?? 0;
        }

        /// <summary>
        /// Get stock quantities for multiple items in one query (optimized)
        /// Used by gRPC service for batch stock check
        /// </summary>
        public async Task<Dictionary<string, int>> GetStockQuantitiesAsync(IEnumerable<string> itemNos)
        {
            var pipeline = _collection.Aggregate()
                .Match(x => itemNos.Contains(x.ItemNo))
                .Group(
                    key => key.ItemNo,
                    group => new
                    {
                        ItemNo = group.Key,
                        TotalQuantity = group.Sum(x => x.Quantity)
                    }
                );

            var results = await pipeline.ToListAsync();
            
            return results.ToDictionary(
                x => x.ItemNo,
                x => x.TotalQuantity
            );
        }
    }
}

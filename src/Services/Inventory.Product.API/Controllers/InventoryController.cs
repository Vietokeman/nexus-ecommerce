using Inventory.API.DTOs;
using Inventory.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Shared.SeedWork;
using System.Net;

namespace Inventory.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;
        private readonly ILogger<InventoryController> _logger;

        public InventoryController(
            IInventoryService inventoryService,
            ILogger<InventoryController> logger)
        {
            _inventoryService = inventoryService ?? throw new ArgumentNullException(nameof(inventoryService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get all inventory entries with pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PagedList<Entities.InventoryEntry>), (int)HttpStatusCode.OK)]
        public async Task<ActionResult<PagedList<Entities.InventoryEntry>>> GetInventoryEntries(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _inventoryService.GetPagedEntriesAsync(pageNumber, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Get inventory entry by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Entities.InventoryEntry), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<ActionResult<Entities.InventoryEntry>> GetInventoryEntry(string id)
        {
            var entry = await _inventoryService.GetEntryByIdAsync(id);
            if (entry == null)
            {
                return NotFound();
            }
            return Ok(entry);
        }

        /// <summary>
        /// Get all entries for a specific item
        /// </summary>
        [HttpGet("items/{itemNo}")]
        [ProducesResponseType(typeof(IEnumerable<Entities.InventoryEntry>), (int)HttpStatusCode.OK)]
        public async Task<ActionResult<IEnumerable<Entities.InventoryEntry>>> GetByItem(string itemNo)
        {
            var entries = await _inventoryService.GetEntriesByItemAsync(itemNo);
            return Ok(entries);
        }

        /// <summary>
        /// Get all entries for a specific document
        /// </summary>
        [HttpGet("documents/{documentNo}")]
        [ProducesResponseType(typeof(IEnumerable<Entities.InventoryEntry>), (int)HttpStatusCode.OK)]
        public async Task<ActionResult<IEnumerable<Entities.InventoryEntry>>> GetByDocument(string documentNo)
        {
            var entries = await _inventoryService.GetEntriesByDocumentAsync(documentNo);
            return Ok(entries);
        }

        /// <summary>
        /// Get current stock quantity for an item
        /// </summary>
        [HttpGet("stock/{itemNo}")]
        [ProducesResponseType(typeof(StockDto), (int)HttpStatusCode.OK)]
        public async Task<ActionResult<StockDto>> GetStock(string itemNo)
        {
            var stock = await _inventoryService.GetStockByItemAsync(itemNo);
            return Ok(stock);
        }

        /// <summary>
        /// Get stock quantities for multiple items (batch operation)
        /// </summary>
        [HttpPost("stock/batch")]
        [ProducesResponseType(typeof(IEnumerable<StockDto>), (int)HttpStatusCode.OK)]
        public async Task<ActionResult<IEnumerable<StockDto>>> GetStocks([FromBody] IEnumerable<string> itemNos)
        {
            var stocks = await _inventoryService.GetStockByItemsAsync(itemNos);
            return Ok(stocks);
        }

        /// <summary>
        /// Create a purchase order (adds stock)
        /// </summary>
        [HttpPost("purchase-orders")]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.Created)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<string>> CreatePurchaseOrder([FromBody] PurchaseOrderDto dto)
        {
            try
            {
                var documentNo = await _inventoryService.CreatePurchaseOrderAsync(dto);
                return CreatedAtAction(nameof(GetByDocument), new { documentNo }, documentNo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating purchase order");
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Create a sales order (deducts stock)
        /// Validates stock availability before creating
        /// </summary>
        [HttpPost("sales-orders")]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.Created)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult<string>> CreateSalesOrder([FromBody] SalesOrderDto dto)
        {
            try
            {
                var documentNo = await _inventoryService.CreateSalesOrderAsync(dto);
                return CreatedAtAction(nameof(GetByDocument), new { documentNo }, documentNo);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Sales order validation failed");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating sales order");
                return BadRequest(ex.Message);
            }
        }

        /// <summary>
        /// Create a custom inventory entry
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.Created)]
        public async Task<ActionResult<string>> CreateInventoryEntry([FromBody] InventoryEntryDto dto)
        {
            var id = await _inventoryService.CreateInventoryEntryAsync(dto);
            return CreatedAtAction(nameof(GetInventoryEntry), new { id }, id);
        }

        /// <summary>
        /// Delete an inventory entry
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType((int)HttpStatusCode.NoContent)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeleteInventoryEntry(string id)
        {
            var result = await _inventoryService.DeleteEntryAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}

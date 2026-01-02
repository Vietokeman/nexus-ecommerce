namespace Inventory.API.DTOs
{
    /// <summary>
    /// DTO for creating inventory entry
    /// </summary>
    public class InventoryEntryDto
    {
        public string DocumentNo { get; set; } = string.Empty;
        public string ItemNo { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string? ExternalDocumentNo { get; set; }
    }
    
    /// <summary>
    /// DTO for stock inquiry response
    /// </summary>
    public class StockDto
    {
        public string ItemNo { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
    
    /// <summary>
    /// DTO for sales order request (deduct stock)
    /// </summary>
    public class SalesOrderDto
    {
        public string DocumentNo { get; set; } = string.Empty;
        public IEnumerable<SalesItemDto> Items { get; set; } = new List<SalesItemDto>();
    }
    
    public class SalesItemDto
    {
        public string ItemNo { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
    
    /// <summary>
    /// DTO for purchase order request (add stock)
    /// </summary>
    public class PurchaseOrderDto
    {
        public string DocumentNo { get; set; } = string.Empty;
        public IEnumerable<PurchaseItemDto> Items { get; set; } = new List<PurchaseItemDto>();
    }
    
    public class PurchaseItemDto
    {
        public string ItemNo { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
}

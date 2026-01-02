namespace Inventory.API.Entities
{
    /// <summary>
    /// MongoDB entity for inventory transactions
    /// Uses flexible schema to handle different document types
    /// </summary>
    public class InventoryEntry
    {
        /// <summary>
        /// MongoDB ObjectId - auto generated
        /// </summary>
        public string Id { get; set; } = string.Empty;
        
        /// <summary>
        /// Unique document number (e.g., PO-2024-001, SO-2024-001)
        /// </summary>
        public string DocumentNo { get; set; } = string.Empty;
        
        /// <summary>
        /// Product/Item number
        /// </summary>
        public string ItemNo { get; set; } = string.Empty;
        
        /// <summary>
        /// Quantity change (+/-) - positive for IN, negative for OUT
        /// </summary>
        public int Quantity { get; set; }
        
        /// <summary>
        /// Document type: Purchase, Sales, Adjustment, Transfer
        /// </summary>
        public string DocumentType { get; set; } = string.Empty;
        
        /// <summary>
        /// External document reference (e.g., OrderId, PurchaseOrderId)
        /// </summary>
        public string? ExternalDocumentNo { get; set; }
        
        /// <summary>
        /// Transaction date
        /// </summary>
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// User who created this entry
        /// </summary>
        public string CreatedBy { get; set; } = "system";
    }
}

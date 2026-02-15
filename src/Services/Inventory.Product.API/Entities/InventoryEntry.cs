using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Inventory.API.Entities
{
    /// <summary>
    /// PostgreSQL entity for inventory transactions (migrated from MongoDB).
    /// Uses EF Core with auto-increment PK.
    /// </summary>
    public class InventoryEntry
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }
        
        /// <summary>
        /// Unique document number (e.g., PO-2024-001, SO-2024-001)
        /// </summary>
        [Required]
        [Column(TypeName = "varchar(100)")]
        public string DocumentNo { get; set; } = string.Empty;
        
        /// <summary>
        /// Product/Item number
        /// </summary>
        [Required]
        [Column(TypeName = "varchar(50)")]
        public string ItemNo { get; set; } = string.Empty;
        
        /// <summary>
        /// Quantity change (+/-) - positive for IN, negative for OUT
        /// </summary>
        public int Quantity { get; set; }
        
        /// <summary>
        /// Document type: Purchase, Sales, Adjustment, Transfer
        /// </summary>
        [Required]
        [Column(TypeName = "varchar(50)")]
        public string DocumentType { get; set; } = string.Empty;
        
        /// <summary>
        /// External document reference (e.g., OrderId, PurchaseOrderId)
        /// </summary>
        [Column(TypeName = "varchar(100)")]
        public string? ExternalDocumentNo { get; set; }

        /// <summary>
        /// Warehouse ID for multi-warehouse support
        /// </summary>
        public long? WarehouseId { get; set; }
        
        /// <summary>
        /// Transaction date
        /// </summary>
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// User who created this entry
        /// </summary>
        [Column(TypeName = "varchar(100)")]
        public string CreatedBy { get; set; } = "system";

        // Navigation
        public Warehouse? Warehouse { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Inventory.API.Entities
{
    /// <summary>
    /// Per-warehouse stock level for each product item.
    /// Enables multi-warehouse stock tracking and sub-order splitting.
    /// </summary>
    public class WarehouseStock
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        public long WarehouseId { get; set; }

        [Required]
        [Column(TypeName = "varchar(50)")]
        public string ItemNo { get; set; } = string.Empty;

        /// <summary>
        /// Current available quantity in this warehouse
        /// </summary>
        public int AvailableQuantity { get; set; }

        /// <summary>
        /// Reserved quantity (for pending orders)
        /// </summary>
        public int ReservedQuantity { get; set; }

        /// <summary>
        /// Total quantity = Available + Reserved
        /// </summary>
        [NotMapped]
        public int TotalQuantity => AvailableQuantity + ReservedQuantity;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        // Navigation
        public Warehouse Warehouse { get; set; } = null!;
    }
}

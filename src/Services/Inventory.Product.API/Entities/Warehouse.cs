using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace Inventory.API.Entities
{
    /// <summary>
    /// Warehouse entity with PostGIS geo-location for smart logistics.
    /// Supports multi-warehouse routing based on proximity.
    /// </summary>
    public class Warehouse
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [Required]
        [Column(TypeName = "varchar(50)")]
        public string Code { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "varchar(200)")]
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "text")]
        public string? Address { get; set; }

        [Column(TypeName = "varchar(100)")]
        public string? City { get; set; }

        [Column(TypeName = "varchar(100)")]
        public string? Province { get; set; }

        /// <summary>
        /// PostGIS geography point for geo-routing (lon, lat)
        /// Used for nearest-warehouse queries with ST_Distance
        /// </summary>
        [Column(TypeName = "geography (point)")]
        public Point? Location { get; set; }

        /// <summary>
        /// Whether this warehouse is active for order fulfillment
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Maximum storage capacity (in units)
        /// </summary>
        public int Capacity { get; set; } = 10000;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? LastModifiedDate { get; set; }

        // Navigation
        public ICollection<WarehouseStock> Stocks { get; set; } = new List<WarehouseStock>();
        public ICollection<InventoryEntry> InventoryEntries { get; set; } = new List<InventoryEntry>();
    }
}

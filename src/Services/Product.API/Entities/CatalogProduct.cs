using Contracts.Domains;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Product.API.Entities
{
    public class CatalogProduct : EntityBase<long>
    {
        [Required]
        [Column(TypeName = "varchar(50)")]
        public string No { get; set; }
        [Required]
        [Column(TypeName = "varchar(250)")]
        public string Name { get; set; }
        [Column(TypeName = "text")]
        public string Summary { get; set; }
        [Column(TypeName = "text")]
        public string Description { get; set; }
        [Column(TypeName = "decimal(12,2)")]
        public decimal Price { get; set; }

        /// <summary>PostgreSQL JSONB for flexible product attributes (colors, sizes, specs)</summary>
        [Column(TypeName = "jsonb")]
        public string? Attributes { get; set; }

        /// <summary>Product category for filtering</summary>
        [Column(TypeName = "varchar(100)")]
        public string? Category { get; set; }

        /// <summary>Product image URL</summary>
        [Column(TypeName = "varchar(500)")]
        public string? ImageUrl { get; set; }
    }
}

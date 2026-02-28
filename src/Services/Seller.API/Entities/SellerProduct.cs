using Contracts.Domains;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Seller.API.Entities
{
    /// <summary>
    /// Seller product listing entity.
    /// Represents a product listed by a seller with AI-generated SEO content.
    /// </summary>
    public class SellerProduct : EntityAuditBase<long>
    {
        [Required]
        [Column(TypeName = "varchar(100)")]
        public string SellerUserName { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(50)")]
        public string No { get; set; } = default!;

        [Required]
        [Column(TypeName = "varchar(250)")]
        public string Name { get; set; } = default!;

        [Column(TypeName = "text")]
        public string? Summary { get; set; }

        [Column(TypeName = "text")]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(12,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "varchar(100)")]
        public string? Category { get; set; }

        [Column(TypeName = "varchar(500)")]
        public string? ImageUrl { get; set; }

        [Column(TypeName = "jsonb")]
        public string? Attributes { get; set; }

        // AI-generated SEO fields
        [Column(TypeName = "varchar(70)")]
        public string? SeoTitle { get; set; }

        [Column(TypeName = "varchar(170)")]
        public string? SeoDescription { get; set; }

        [Column(TypeName = "text")]
        public string? SeoKeywords { get; set; }

        [Column(TypeName = "text")]
        public string? Highlights { get; set; }

        public int StockQuantity { get; set; }

        [Column(TypeName = "varchar(20)")]
        public string Status { get; set; } = "Draft";
        // Draft, PendingReview, Active, Inactive, Rejected
    }
}

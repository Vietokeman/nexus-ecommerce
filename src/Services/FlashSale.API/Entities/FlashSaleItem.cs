using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlashSale.API.Entities;

/// <summary>
/// Individual product item in a flash sale session.
/// Stock is managed atomically via Redis Lua Script for high-concurrency safety.
/// </summary>
public class FlashSaleItem
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    public long SessionId { get; set; }

    /// <summary>
    /// Reference to the product catalog (Product.API)
    /// </summary>
    [Required]
    [Column(TypeName = "varchar(50)")]
    public string ProductNo { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "varchar(200)")]
    public string ProductName { get; set; } = string.Empty;

    /// <summary>
    /// Original price before flash sale discount
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal OriginalPrice { get; set; }

    /// <summary>
    /// Flash sale discounted price
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal FlashPrice { get; set; }

    /// <summary>
    /// Total stock allocated for this flash sale item
    /// </summary>
    [Required]
    public int TotalStock { get; set; }

    /// <summary>
    /// Sold quantity (updated from Redis periodically for consistency)
    /// </summary>
    public int SoldQuantity { get; set; }

    /// <summary>
    /// Max quantity per user per session
    /// </summary>
    public int MaxPerUser { get; set; } = 1;

    [Column(TypeName = "varchar(500)")]
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(SessionId))]
    public FlashSaleSession Session { get; set; } = null!;
}

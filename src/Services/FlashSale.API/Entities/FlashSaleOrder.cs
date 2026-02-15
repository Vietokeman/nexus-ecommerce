using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlashSale.API.Entities;

/// <summary>
/// Records a user's flash sale purchase for per-user limit enforcement.
/// </summary>
public class FlashSaleOrder
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    public long ItemId { get; set; }

    [Required]
    [Column(TypeName = "varchar(100)")]
    public string UserName { get; set; } = string.Empty;

    [Required]
    public int Quantity { get; set; } = 1;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Required]
    [Column(TypeName = "varchar(20)")]
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(ItemId))]
    public FlashSaleItem Item { get; set; } = null!;
}

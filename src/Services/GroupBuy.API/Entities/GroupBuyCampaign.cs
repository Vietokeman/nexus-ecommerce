using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GroupBuy.API.Entities;

/// <summary>
/// A group buying campaign (Pinduoduo model).
/// A campaign defines the product, target group size, and discount tiers.
/// </summary>
public class GroupBuyCampaign
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    [Column(TypeName = "varchar(200)")]
    public string Name { get; set; } = string.Empty;

    [Column(TypeName = "text")]
    public string? Description { get; set; }

    /// <summary>
    /// Reference to product catalog (Product.API)
    /// </summary>
    [Required]
    [Column(TypeName = "varchar(50)")]
    public string ProductNo { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "varchar(200)")]
    public string ProductName { get; set; } = string.Empty;

    [Column(TypeName = "varchar(500)")]
    public string? ImageUrl { get; set; }

    /// <summary>
    /// Original retail price
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal OriginalPrice { get; set; }

    /// <summary>
    /// Group buy discounted price (when target reached)
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal GroupPrice { get; set; }

    /// <summary>
    /// Minimum participants to unlock the group price
    /// </summary>
    [Required]
    public int MinParticipants { get; set; } = 3;

    /// <summary>
    /// Maximum participants (stock limit per group)
    /// </summary>
    public int MaxParticipants { get; set; } = 50;

    /// <summary>
    /// Duration for each group session to reach target (hours)
    /// </summary>
    public int SessionDurationHours { get; set; } = 24;

    /// <summary>
    /// Campaign status: Draft, Active, Ended, Cancelled
    /// </summary>
    [Required]
    [Column(TypeName = "varchar(20)")]
    public string Status { get; set; } = "Draft";

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<GroupBuySession> Sessions { get; set; } = new List<GroupBuySession>();
}

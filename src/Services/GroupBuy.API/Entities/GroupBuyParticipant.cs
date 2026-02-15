using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GroupBuy.API.Entities;

/// <summary>
/// A participant in a group buying session.
/// </summary>
public class GroupBuyParticipant
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    public long SessionId { get; set; }

    [Required]
    [Column(TypeName = "varchar(100)")]
    public string UserName { get; set; } = string.Empty;

    [Required]
    public int Quantity { get; set; } = 1;

    /// <summary>
    /// Price locked at time of joining (group price)
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Status: Joined, Confirmed, Refunded
    /// Joined → waiting for group target
    /// Confirmed → group succeeded, order placed
    /// Refunded → group failed, payment returned
    /// </summary>
    [Required]
    [Column(TypeName = "varchar(20)")]
    public string Status { get; set; } = "Joined";

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ConfirmedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(SessionId))]
    public GroupBuySession Session { get; set; } = null!;
}

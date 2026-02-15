using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlashSale.API.Entities;

/// <summary>
/// Flash sale session — a time-bound promotional window.
/// Supports 100k CCU with Redis Lua Script for atomic stock deduction.
/// </summary>
public class FlashSaleSession
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    [Column(TypeName = "varchar(200)")]
    public string Name { get; set; } = string.Empty;

    [Column(TypeName = "text")]
    public string? Description { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    /// <summary>
    /// Current status: Draft, Active, Ended, Cancelled
    /// </summary>
    [Required]
    [Column(TypeName = "varchar(20)")]
    public string Status { get; set; } = "Draft";

    /// <summary>
    /// Maximum concurrent users allowed (soft limit for monitoring)
    /// </summary>
    public int MaxConcurrentUsers { get; set; } = 100000;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<FlashSaleItem> Items { get; set; } = new List<FlashSaleItem>();
}

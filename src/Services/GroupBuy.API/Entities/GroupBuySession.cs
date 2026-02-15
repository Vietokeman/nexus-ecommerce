using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GroupBuy.API.Entities;

/// <summary>
/// A specific group buying session opened by a leader.
/// When MinParticipants is reached within the deadline, the group succeeds.
/// Otherwise, Hangfire triggers auto-refund.
/// </summary>
public class GroupBuySession
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    public long CampaignId { get; set; }

    /// <summary>
    /// The user who initiated (opened) this group session
    /// </summary>
    [Required]
    [Column(TypeName = "varchar(100)")]
    public string LeaderUserName { get; set; } = string.Empty;

    /// <summary>
    /// Current participant count
    /// </summary>
    public int CurrentParticipants { get; set; } = 1; // Leader counts

    /// <summary>
    /// Deadline for this group to reach MinParticipants
    /// </summary>
    [Required]
    public DateTime Deadline { get; set; }

    /// <summary>
    /// Status: Open, Succeeded, Failed, Cancelled
    /// Open → collecting participants
    /// Succeeded → target reached, orders confirmed
    /// Failed → deadline passed without reaching target, auto-refund
    /// </summary>
    [Required]
    [Column(TypeName = "varchar(20)")]
    public string Status { get; set; } = "Open";

    /// <summary>
    /// Shareable invite code for social sharing
    /// </summary>
    [Required]
    [Column(TypeName = "varchar(20)")]
    public string InviteCode { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    // Navigation
    [ForeignKey(nameof(CampaignId))]
    public GroupBuyCampaign Campaign { get; set; } = null!;

    public ICollection<GroupBuyParticipant> Participants { get; set; } = new List<GroupBuyParticipant>();
}

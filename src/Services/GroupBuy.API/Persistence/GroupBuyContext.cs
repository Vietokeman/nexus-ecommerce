using GroupBuy.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace GroupBuy.API.Persistence;

public class GroupBuyContext : DbContext
{
    public GroupBuyContext(DbContextOptions<GroupBuyContext> options) : base(options) { }

    public DbSet<GroupBuyCampaign> Campaigns { get; set; } = null!;
    public DbSet<GroupBuySession> Sessions { get; set; } = null!;
    public DbSet<GroupBuyParticipant> Participants { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Campaign
        modelBuilder.Entity<GroupBuyCampaign>(e =>
        {
            e.ToTable("GroupBuyCampaigns");
            e.HasIndex(c => c.Status);
            e.HasIndex(c => c.ProductNo);
            e.HasIndex(c => new { c.StartDate, c.EndDate });
        });

        // Session
        modelBuilder.Entity<GroupBuySession>(e =>
        {
            e.ToTable("GroupBuySessions");
            e.HasIndex(s => s.InviteCode).IsUnique();
            e.HasIndex(s => s.Status);
            e.HasIndex(s => s.Deadline);
            e.HasIndex(s => s.LeaderUserName);
            e.HasOne(s => s.Campaign)
                .WithMany(c => c.Sessions)
                .HasForeignKey(s => s.CampaignId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Participant
        modelBuilder.Entity<GroupBuyParticipant>(e =>
        {
            e.ToTable("GroupBuyParticipants");
            e.HasIndex(p => new { p.SessionId, p.UserName }).IsUnique();
            e.HasIndex(p => p.UserName);
            e.HasOne(p => p.Session)
                .WithMany(s => s.Participants)
                .HasForeignKey(p => p.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

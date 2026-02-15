using GroupBuy.API.Entities;
using GroupBuy.API.Persistence;
using GroupBuy.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GroupBuy.API.Repositories;

public class GroupBuyRepository : IGroupBuyRepository
{
    private readonly GroupBuyContext _context;

    public GroupBuyRepository(GroupBuyContext context)
    {
        _context = context;
    }

    // Campaigns
    public async Task<IEnumerable<GroupBuyCampaign>> GetAllCampaignsAsync()
        => await _context.Campaigns
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

    public async Task<GroupBuyCampaign?> GetCampaignByIdAsync(long id)
        => await _context.Campaigns
            .Include(c => c.Sessions)
                .ThenInclude(s => s.Participants)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<IEnumerable<GroupBuyCampaign>> GetActiveCampaignsAsync()
    {
        var now = DateTime.UtcNow;
        return await _context.Campaigns
            .Where(c => c.Status == "Active" && c.StartDate <= now && c.EndDate >= now)
            .ToListAsync();
    }

    public async Task<GroupBuyCampaign> CreateCampaignAsync(GroupBuyCampaign campaign)
    {
        await _context.Campaigns.AddAsync(campaign);
        await _context.SaveChangesAsync();
        return campaign;
    }

    public async Task UpdateCampaignAsync(GroupBuyCampaign campaign)
    {
        campaign.UpdatedAt = DateTime.UtcNow;
        _context.Campaigns.Update(campaign);
        await _context.SaveChangesAsync();
    }

    // Sessions
    public async Task<GroupBuySession?> GetSessionByIdAsync(long id)
        => await _context.Sessions
            .Include(s => s.Campaign)
            .Include(s => s.Participants)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<GroupBuySession?> GetSessionByInviteCodeAsync(string inviteCode)
        => await _context.Sessions
            .Include(s => s.Campaign)
            .Include(s => s.Participants)
            .FirstOrDefaultAsync(s => s.InviteCode == inviteCode);

    public async Task<IEnumerable<GroupBuySession>> GetOpenSessionsByCampaignAsync(long campaignId)
        => await _context.Sessions
            .Include(s => s.Participants)
            .Where(s => s.CampaignId == campaignId && s.Status == "Open")
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<GroupBuySession>> GetExpiredOpenSessionsAsync()
    {
        var now = DateTime.UtcNow;
        return await _context.Sessions
            .Include(s => s.Campaign)
            .Include(s => s.Participants)
            .Where(s => s.Status == "Open" && s.Deadline < now)
            .ToListAsync();
    }

    public async Task<GroupBuySession> CreateSessionAsync(GroupBuySession session)
    {
        await _context.Sessions.AddAsync(session);
        await _context.SaveChangesAsync();
        return session;
    }

    public async Task UpdateSessionAsync(GroupBuySession session)
    {
        _context.Sessions.Update(session);
        await _context.SaveChangesAsync();
    }

    // Participants
    public async Task<GroupBuyParticipant> AddParticipantAsync(GroupBuyParticipant participant)
    {
        await _context.Participants.AddAsync(participant);
        await _context.SaveChangesAsync();
        return participant;
    }

    public async Task<bool> IsUserInSessionAsync(long sessionId, string userName)
        => await _context.Participants
            .AnyAsync(p => p.SessionId == sessionId && p.UserName == userName);

    public async Task<IEnumerable<GroupBuyParticipant>> GetParticipantsBySessionAsync(long sessionId)
        => await _context.Participants
            .Where(p => p.SessionId == sessionId)
            .OrderBy(p => p.JoinedAt)
            .ToListAsync();

    public async Task UpdateParticipantsStatusAsync(long sessionId, string status)
    {
        var participants = await _context.Participants
            .Where(p => p.SessionId == sessionId)
            .ToListAsync();

        foreach (var p in participants)
        {
            p.Status = status;
            if (status == "Confirmed") p.ConfirmedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }
}

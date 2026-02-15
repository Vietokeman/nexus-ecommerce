using GroupBuy.API.Entities;

namespace GroupBuy.API.Repositories.Interfaces;

public interface IGroupBuyRepository
{
    // Campaigns
    Task<IEnumerable<GroupBuyCampaign>> GetAllCampaignsAsync();
    Task<GroupBuyCampaign?> GetCampaignByIdAsync(long id);
    Task<IEnumerable<GroupBuyCampaign>> GetActiveCampaignsAsync();
    Task<GroupBuyCampaign> CreateCampaignAsync(GroupBuyCampaign campaign);
    Task UpdateCampaignAsync(GroupBuyCampaign campaign);

    // Sessions
    Task<GroupBuySession?> GetSessionByIdAsync(long id);
    Task<GroupBuySession?> GetSessionByInviteCodeAsync(string inviteCode);
    Task<IEnumerable<GroupBuySession>> GetOpenSessionsByCampaignAsync(long campaignId);
    Task<IEnumerable<GroupBuySession>> GetExpiredOpenSessionsAsync();
    Task<GroupBuySession> CreateSessionAsync(GroupBuySession session);
    Task UpdateSessionAsync(GroupBuySession session);

    // Participants
    Task<GroupBuyParticipant> AddParticipantAsync(GroupBuyParticipant participant);
    Task<bool> IsUserInSessionAsync(long sessionId, string userName);
    Task<IEnumerable<GroupBuyParticipant>> GetParticipantsBySessionAsync(long sessionId);
    Task UpdateParticipantsStatusAsync(long sessionId, string status);
}

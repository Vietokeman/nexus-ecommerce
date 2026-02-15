using GroupBuy.API.Entities;

namespace GroupBuy.API.Services.Interfaces;

public interface IGroupBuyService
{
    // Campaigns
    Task<IEnumerable<GroupBuyCampaign>> GetAllCampaignsAsync();
    Task<IEnumerable<GroupBuyCampaign>> GetActiveCampaignsAsync();
    Task<GroupBuyCampaign?> GetCampaignByIdAsync(long id);
    Task<GroupBuyCampaign> CreateCampaignAsync(GroupBuyCampaign campaign);

    // Sessions
    Task<GroupBuySession> OpenGroupAsync(long campaignId, string leaderUserName, int quantity);
    Task<GroupBuySession?> GetSessionByInviteCodeAsync(string inviteCode);
    Task<GroupBuyParticipant> JoinGroupAsync(string inviteCode, string userName, int quantity);
    Task ProcessExpiredSessionsAsync();
}

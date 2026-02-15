using GroupBuy.API.Entities;
using GroupBuy.API.Repositories.Interfaces;
using GroupBuy.API.Services.Interfaces;

namespace GroupBuy.API.Services;

public class GroupBuyService : IGroupBuyService
{
    private readonly IGroupBuyRepository _repository;
    private readonly ILogger<GroupBuyService> _logger;

    public GroupBuyService(IGroupBuyRepository repository, ILogger<GroupBuyService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IEnumerable<GroupBuyCampaign>> GetAllCampaignsAsync()
        => await _repository.GetAllCampaignsAsync();

    public async Task<IEnumerable<GroupBuyCampaign>> GetActiveCampaignsAsync()
        => await _repository.GetActiveCampaignsAsync();

    public async Task<GroupBuyCampaign?> GetCampaignByIdAsync(long id)
        => await _repository.GetCampaignByIdAsync(id);

    public async Task<GroupBuyCampaign> CreateCampaignAsync(GroupBuyCampaign campaign)
        => await _repository.CreateCampaignAsync(campaign);

    /// <summary>
    /// A user opens a new group buying session (becomes the leader).
    /// Generates a shareable invite code for social sharing.
    /// </summary>
    public async Task<GroupBuySession> OpenGroupAsync(long campaignId, string leaderUserName, int quantity)
    {
        var campaign = await _repository.GetCampaignByIdAsync(campaignId)
            ?? throw new KeyNotFoundException($"Campaign {campaignId} not found");

        if (campaign.Status != "Active")
            throw new InvalidOperationException("Campaign is not active");

        var inviteCode = GenerateInviteCode();

        var session = new GroupBuySession
        {
            CampaignId = campaignId,
            LeaderUserName = leaderUserName,
            CurrentParticipants = 1,
            Deadline = DateTime.UtcNow.AddHours(campaign.SessionDurationHours),
            InviteCode = inviteCode,
            Status = "Open"
        };

        var created = await _repository.CreateSessionAsync(session);

        // Leader is also the first participant
        await _repository.AddParticipantAsync(new GroupBuyParticipant
        {
            SessionId = created.Id,
            UserName = leaderUserName,
            Quantity = quantity,
            UnitPrice = campaign.GroupPrice,
            Status = "Joined"
        });

        _logger.LogInformation(
            "Group buy session opened: SessionId={SessionId}, Campaign={CampaignId}, Leader={Leader}, InviteCode={Code}",
            created.Id, campaignId, leaderUserName, inviteCode);

        return created;
    }

    public async Task<GroupBuySession?> GetSessionByInviteCodeAsync(string inviteCode)
        => await _repository.GetSessionByInviteCodeAsync(inviteCode);

    /// <summary>
    /// A user joins an existing group via invite code.
    /// If the group reaches MinParticipants, automatically transitions to Succeeded.
    /// </summary>
    public async Task<GroupBuyParticipant> JoinGroupAsync(string inviteCode, string userName, int quantity)
    {
        var session = await _repository.GetSessionByInviteCodeAsync(inviteCode)
            ?? throw new KeyNotFoundException($"Group with invite code '{inviteCode}' not found");

        if (session.Status != "Open")
            throw new InvalidOperationException("Group session is no longer open");

        if (DateTime.UtcNow > session.Deadline)
            throw new InvalidOperationException("Group session has expired");

        if (await _repository.IsUserInSessionAsync(session.Id, userName))
            throw new InvalidOperationException("You have already joined this group");

        if (session.CurrentParticipants >= session.Campaign.MaxParticipants)
            throw new InvalidOperationException("Group is full");

        var participant = await _repository.AddParticipantAsync(new GroupBuyParticipant
        {
            SessionId = session.Id,
            UserName = userName,
            Quantity = quantity,
            UnitPrice = session.Campaign.GroupPrice,
            Status = "Joined"
        });

        session.CurrentParticipants++;

        // Check if target reached → auto-succeed
        if (session.CurrentParticipants >= session.Campaign.MinParticipants)
        {
            session.Status = "Succeeded";
            session.CompletedAt = DateTime.UtcNow;
            await _repository.UpdateParticipantsStatusAsync(session.Id, "Confirmed");

            _logger.LogInformation(
                "Group buy session SUCCEEDED: SessionId={SessionId}, Participants={Count}/{Target}",
                session.Id, session.CurrentParticipants, session.Campaign.MinParticipants);
        }

        await _repository.UpdateSessionAsync(session);

        return participant;
    }

    /// <summary>
    /// Process expired group sessions (called by Hangfire scheduled job).
    /// Marks expired sessions as Failed and participants as Refunded.
    /// </summary>
    public async Task ProcessExpiredSessionsAsync()
    {
        var expiredSessions = await _repository.GetExpiredOpenSessionsAsync();

        foreach (var session in expiredSessions)
        {
            session.Status = "Failed";
            session.CompletedAt = DateTime.UtcNow;
            await _repository.UpdateSessionAsync(session);
            await _repository.UpdateParticipantsStatusAsync(session.Id, "Refunded");

            _logger.LogInformation(
                "Group buy session FAILED (expired): SessionId={SessionId}, Participants={Count}/{Target}",
                session.Id, session.CurrentParticipants, session.Campaign.MinParticipants);
        }

        if (expiredSessions.Any())
        {
            _logger.LogInformation("Processed {Count} expired group buy sessions", expiredSessions.Count());
        }
    }

    private static string GenerateInviteCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = Random.Shared;
        return new string(Enumerable.Range(0, 8).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }
}

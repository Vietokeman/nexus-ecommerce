using GroupBuy.API.Entities;
using GroupBuy.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GroupBuy.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupBuysController : ControllerBase
{
    private readonly IGroupBuyService _service;

    public GroupBuysController(IGroupBuyService service)
    {
        _service = service;
    }

    // ─── Campaigns ───────────────────────────────────────────

    /// <summary>
    /// Get all group buy campaigns
    /// </summary>
    [HttpGet("campaigns")]
    public async Task<IActionResult> GetAllCampaigns()
    {
        var campaigns = await _service.GetAllCampaignsAsync();
        return Ok(campaigns);
    }

    /// <summary>
    /// Get active campaigns
    /// </summary>
    [HttpGet("campaigns/active")]
    public async Task<IActionResult> GetActiveCampaigns()
    {
        var campaigns = await _service.GetActiveCampaignsAsync();
        return Ok(campaigns);
    }

    /// <summary>
    /// Get campaign by ID (includes sessions and participants)
    /// </summary>
    [HttpGet("campaigns/{id:long}")]
    public async Task<IActionResult> GetCampaign(long id)
    {
        var campaign = await _service.GetCampaignByIdAsync(id);
        if (campaign == null) return NotFound();
        return Ok(campaign);
    }

    /// <summary>
    /// Create a new group buy campaign
    /// </summary>
    [HttpPost("campaigns")]
    public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignRequest request)
    {
        var campaign = new GroupBuyCampaign
        {
            Name = request.Name,
            Description = request.Description,
            ProductNo = request.ProductNo,
            ProductName = request.ProductName,
            ImageUrl = request.ImageUrl,
            OriginalPrice = request.OriginalPrice,
            GroupPrice = request.GroupPrice,
            MinParticipants = request.MinParticipants,
            MaxParticipants = request.MaxParticipants,
            SessionDurationHours = request.SessionDurationHours,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = "Active"
        };

        var created = await _service.CreateCampaignAsync(campaign);
        return CreatedAtAction(nameof(GetCampaign), new { id = created.Id }, created);
    }

    // ─── Sessions ────────────────────────────────────────────

    /// <summary>
    /// Open a new group buying session (become the leader)
    /// </summary>
    [HttpPost("sessions/open")]
    public async Task<IActionResult> OpenGroup([FromBody] OpenGroupRequest request)
    {
        try
        {
            var session = await _service.OpenGroupAsync(request.CampaignId, request.UserName, request.Quantity);
            return Ok(session);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Join a group via invite code (social sharing)
    /// </summary>
    [HttpPost("sessions/join")]
    public async Task<IActionResult> JoinGroup([FromBody] JoinGroupRequest request)
    {
        try
        {
            var participant = await _service.JoinGroupAsync(request.InviteCode, request.UserName, request.Quantity);
            return Ok(participant);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get group session by invite code
    /// </summary>
    [HttpGet("sessions/invite/{inviteCode}")]
    public async Task<IActionResult> GetByInviteCode(string inviteCode)
    {
        var session = await _service.GetSessionByInviteCodeAsync(inviteCode);
        if (session == null) return NotFound();
        return Ok(session);
    }

    /// <summary>
    /// Manually trigger expired session processing (normally done by Hangfire)
    /// </summary>
    [HttpPost("sessions/process-expired")]
    public async Task<IActionResult> ProcessExpired()
    {
        await _service.ProcessExpiredSessionsAsync();
        return Ok(new { message = "Expired sessions processed" });
    }
}

// ─── Request DTOs ────────────────────────────────────────────

public record CreateCampaignRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string ProductNo { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }
    public decimal OriginalPrice { get; init; }
    public decimal GroupPrice { get; init; }
    public int MinParticipants { get; init; } = 3;
    public int MaxParticipants { get; init; } = 50;
    public int SessionDurationHours { get; init; } = 24;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
}

public record OpenGroupRequest
{
    public long CampaignId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public int Quantity { get; init; } = 1;
}

public record JoinGroupRequest
{
    public string InviteCode { get; init; } = string.Empty;
    public string UserName { get; init; } = string.Empty;
    public int Quantity { get; init; } = 1;
}

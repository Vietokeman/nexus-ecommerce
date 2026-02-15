using FlashSale.API.Entities;
using FlashSale.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FlashSale.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FlashSalesController : ControllerBase
{
    private readonly IFlashSaleService _service;

    public FlashSalesController(IFlashSaleService service)
    {
        _service = service;
    }

    /// <summary>
    /// Get all flash sale sessions
    /// </summary>
    [HttpGet("sessions")]
    public async Task<IActionResult> GetAllSessions()
    {
        var sessions = await _service.GetAllSessionsAsync();
        return Ok(sessions);
    }

    /// <summary>
    /// Get active flash sale sessions
    /// </summary>
    [HttpGet("sessions/active")]
    public async Task<IActionResult> GetActiveSessions()
    {
        var sessions = await _service.GetActiveSessionsAsync();
        return Ok(sessions);
    }

    /// <summary>
    /// Get a specific session by ID
    /// </summary>
    [HttpGet("sessions/{id:long}")]
    public async Task<IActionResult> GetSession(long id)
    {
        var session = await _service.GetSessionByIdAsync(id);
        if (session == null) return NotFound();
        return Ok(session);
    }

    /// <summary>
    /// Create a new flash sale session
    /// </summary>
    [HttpPost("sessions")]
    public async Task<IActionResult> CreateSession([FromBody] CreateFlashSaleSessionRequest request)
    {
        var session = new FlashSaleSession
        {
            Name = request.Name,
            Description = request.Description,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            MaxConcurrentUsers = request.MaxConcurrentUsers
        };

        var created = await _service.CreateSessionAsync(session);
        return CreatedAtAction(nameof(GetSession), new { id = created.Id }, created);
    }

    /// <summary>
    /// Activate a session (pre-loads stock to Redis)
    /// </summary>
    [HttpPost("sessions/{id:long}/activate")]
    public async Task<IActionResult> ActivateSession(long id)
    {
        await _service.ActivateSessionAsync(id);
        return Ok(new { message = "Session activated, stock loaded to Redis" });
    }

    /// <summary>
    /// End a session (syncs Redis stock back to PostgreSQL)
    /// </summary>
    [HttpPost("sessions/{id:long}/end")]
    public async Task<IActionResult> EndSession(long id)
    {
        await _service.EndSessionAsync(id);
        return Ok(new { message = "Session ended, stock synced to PostgreSQL" });
    }

    /// <summary>
    /// Purchase a flash sale item (Redis Lua Script atomic deduction)
    /// </summary>
    [HttpPost("purchase")]
    public async Task<IActionResult> Purchase([FromBody] FlashSalePurchaseRequest request)
    {
        try
        {
            var order = await _service.PurchaseAsync(request.ItemId, request.UserName, request.Quantity);
            return Ok(order);
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
    /// Get remaining stock for a flash sale item (from Redis)
    /// </summary>
    [HttpGet("items/{itemId:long}/stock")]
    public async Task<IActionResult> GetRemainingStock(long itemId)
    {
        var stock = await _service.GetRemainingStockAsync(itemId);
        return Ok(new { itemId, remainingStock = stock });
    }

    /// <summary>
    /// Get user's flash sale orders
    /// </summary>
    [HttpGet("orders/{userName}")]
    public async Task<IActionResult> GetUserOrders(string userName)
    {
        var orders = await _service.GetUserOrdersAsync(userName);
        return Ok(orders);
    }
}

// Request DTOs
public record CreateFlashSaleSessionRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime StartTime { get; init; }
    public DateTime EndTime { get; init; }
    public int MaxConcurrentUsers { get; init; } = 100000;
}

public record FlashSalePurchaseRequest
{
    public long ItemId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public int Quantity { get; init; } = 1;
}

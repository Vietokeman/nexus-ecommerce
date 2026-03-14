using Admin.API.Models;
using Admin.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Admin.API.Controllers;

[ApiController]
[Route("api/admin/notifications")]
public sealed class NotificationController(INotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public ActionResult<PageResult<NotificationModel>> GetNotifications([FromQuery] bool? isRead, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
    {
        var result = notificationService.GetPaged(isRead, pageIndex, pageSize);
        return Ok(result);
    }

    [HttpGet("unread-count")]
    public ActionResult<object> GetUnreadCount()
    {
        return Ok(new { unreadCount = notificationService.GetUnreadCount() });
    }

    [HttpPost("{id:guid}/mark-as-read")]
    public IActionResult MarkAsRead(Guid id)
    {
        return notificationService.MarkAsRead(id) ? Ok() : NotFound();
    }

    [HttpPost("mark-all-as-read")]
    public ActionResult<object> MarkAllAsRead()
    {
        var updatedCount = notificationService.MarkAllAsRead();
        return Ok(new { updatedCount });
    }

    [HttpPost("publish")]
    public async Task<ActionResult<NotificationModel>> Publish([FromBody] CreateNotificationRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest("Title and Message are required.");
        }

        var result = await notificationService.PublishAsync(request, cancellationToken);
        return Ok(result);
    }
}

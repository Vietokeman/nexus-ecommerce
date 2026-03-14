using Admin.API.Models;
using Admin.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Admin.API.Controllers;

[ApiController]
[Route("api/admin/audit-logs")]
public sealed class AuditLogsController(IAuditLogService auditLogService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PageResult<AuditLogItemModel>>> GetAuditLogs(
        [FromQuery] string? searchTerm,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await auditLogService.SearchAsync(searchTerm, startDate, endDate, page, pageSize, cancellationToken);
        return Ok(result);
    }
}

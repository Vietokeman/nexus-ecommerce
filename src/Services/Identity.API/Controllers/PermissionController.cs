using Dapper;
using Identity.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class PermissionController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<PermissionController> _logger;

    public PermissionController(IConfiguration configuration, ILogger<PermissionController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/permission — Get all permissions (Dapper)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Permission>>> GetAll()
    {
        await using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnectionString"));
        var permissions = await connection.QueryAsync<Permission>("SELECT \"Id\", \"Function\", \"Command\", \"RoleId\" FROM \"Permissions\"");
        return Ok(permissions);
    }

    /// <summary>
    /// GET /api/permission/{roleId} — Get permissions by role
    /// </summary>
    [HttpGet("{roleId}")]
    public async Task<ActionResult<IEnumerable<Permission>>> GetByRole(string roleId)
    {
        await using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnectionString"));
        var permissions = await connection.QueryAsync<Permission>(
            "SELECT \"Id\", \"Function\", \"Command\", \"RoleId\" FROM \"Permissions\" WHERE \"RoleId\" = @RoleId",
            new { RoleId = roleId });
        return Ok(permissions);
    }

    /// <summary>
    /// POST /api/permission — Create a new permission (Dapper)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Permission>> Create([FromBody] Permission permission)
    {
        await using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnectionString"));
        var id = await connection.ExecuteScalarAsync<int>(
            "INSERT INTO \"Permissions\" (\"Function\", \"Command\", \"RoleId\") VALUES (@Function, @Command, @RoleId) RETURNING \"Id\"",
            new { permission.Function, permission.Command, permission.RoleId });

        permission.Id = id;
        _logger.LogInformation("Permission created: {Function}.{Command} for role {RoleId}", permission.Function, permission.Command, permission.RoleId);

        return CreatedAtAction(nameof(GetByRole), new { roleId = permission.RoleId }, permission);
    }

    /// <summary>
    /// DELETE /api/permission/{id} — Delete permission
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await using var connection = new NpgsqlConnection(_configuration.GetConnectionString("DefaultConnectionString"));
        var affected = await connection.ExecuteAsync("DELETE FROM \"Permissions\" WHERE \"Id\" = @Id", new { Id = id });

        if (affected == 0)
            return NotFound();

        _logger.LogInformation("Permission {Id} deleted", id);
        return NoContent();
    }
}

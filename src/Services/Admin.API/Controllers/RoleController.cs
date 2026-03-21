using Admin.API.Models;
using Admin.API.Services;
using Admin.API.Stores;
using Microsoft.AspNetCore.Mvc;

namespace Admin.API.Controllers;

[ApiController]
[Route("api/admin/role")]
public sealed class RoleController(AdminDataStore store, INotificationService notificationService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateRole([FromBody] CreateUpdateRoleRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Name is required.");
        }

        var created = store.Locked(() =>
        {
            if (store.ExistsRoleName(request.Name))
            {
                return false;
            }

            store.Roles.Add(new RoleModel
            {
                Name = request.Name.Trim(),
                DisplayName = request.DisplayName.Trim()
            });
            store.RebuildIndexes();
            return true;
        });

        if (!created)
        {
            return BadRequest("Role already exists.");
        }

        await notificationService.PublishAsync(new CreateNotificationRequest
        {
            Title = "Role created",
            Message = $"Role '{request.Name}' was created.",
            Link = "/admin/profile",
            Type = "Role"
        }, cancellationToken);

        return Ok();
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] CreateUpdateRoleRequest request, CancellationToken cancellationToken)
    {
        var updated = store.Locked(() =>
        {
            var role = store.Roles.FirstOrDefault(x => x.Id == id);
            if (role is null)
            {
                return false;
            }

            if (store.ExistsRoleName(request.Name, id))
            {
                return false;
            }

            role.Name = request.Name.Trim();
            role.DisplayName = request.DisplayName.Trim();
            store.RebuildIndexes();
            return true;
        });

        if (!updated)
        {
            return NotFound();
        }

        await notificationService.PublishAsync(new CreateNotificationRequest
        {
            Title = "Role updated",
            Message = $"Role '{request.Name}' was updated.",
            Link = "/admin/profile",
            Type = "Role"
        }, cancellationToken);

        return Ok();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteRoles([FromQuery] Guid[] ids, CancellationToken cancellationToken)
    {
        var deleted = 0;
        store.Locked(() =>
        {
            deleted = store.Roles.RemoveAll(role => ids.Contains(role.Id));
            store.RebuildIndexes();
        });

        if (deleted > 0)
        {
            await notificationService.PublishAsync(new CreateNotificationRequest
            {
                Title = "Roles removed",
                Message = $"{deleted} role(s) were deleted.",
                Link = "/admin/profile",
                Type = "Role"
            }, cancellationToken);
        }

        return Ok();
    }

    [HttpGet("{id:guid}")]
    public ActionResult<RoleModel> GetRoleById(Guid id)
    {
        var role = store.FindRoleById(id);
        return role is null ? NotFound() : Ok(role);
    }

    [HttpGet("paging")]
    public ActionResult<PageResult<RoleModel>> GetRolesAllPaging(string? keyword, int pageIndex = 1, int pageSize = 10)
    {
        var (items, total) = store.Locked(() =>
        {
            var query = store.Roles.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(x =>
                    x.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                    || x.DisplayName.Contains(keyword, StringComparison.OrdinalIgnoreCase));
            }

            var totalRows = query.Count();
            var pageItems = query
                .OrderBy(x => x.Name)
                .Skip((Math.Max(pageIndex, 1) - 1) * Math.Max(pageSize, 1))
                .Take(Math.Max(pageSize, 1))
                .ToList();

            return (pageItems, totalRows);
        });

        return Ok(new PageResult<RoleModel>
        {
            Results = items,
            CurrentPage = Math.Max(pageIndex, 1),
            PageSize = Math.Max(pageSize, 1),
            RowCount = total
        });
    }

    [HttpGet("all")]
    public ActionResult<List<RoleModel>> GetAllRoles()
    {
        var model = store.Locked(() => store.Roles.OrderBy(x => x.Name).ToList());
        return Ok(model);
    }

    [HttpGet("{roleId}/permissions")]
    public ActionResult<PermissionDto> GetAllRolePermissions(string roleId)
    {
        if (!Guid.TryParse(roleId, out var id))
        {
            return BadRequest("Invalid role id.");
        }

        var permission = store.Locked(() =>
        {
            var role = store.Roles.FirstOrDefault(x => x.Id == id);
            if (role is null)
            {
                return null;
            }

            var selected = role.Claims.Select(x => x.Value).ToHashSet(StringComparer.OrdinalIgnoreCase);
            return new PermissionDto
            {
                RoleId = roleId,
                RoleClaims = PermissionCatalog.Values
                    .Select(value => new RoleClaimModel
                    {
                        Value = value,
                        Selected = selected.Contains(value)
                    })
                    .ToList()
            };
        });

        return permission is null ? NotFound() : Ok(permission);
    }

    [HttpPut("permissions")]
    public IActionResult SavePermission([FromBody] PermissionDto model)
    {
        if (!Guid.TryParse(model.RoleId, out var id))
        {
            return BadRequest("Invalid role id.");
        }

        var updated = store.Locked(() =>
        {
            var role = store.Roles.FirstOrDefault(x => x.Id == id);
            if (role is null)
            {
                return false;
            }

            role.Claims = model.RoleClaims
                .Where(x => x.Selected)
                .Select(x => new RoleClaimModel { Value = x.Value, Selected = true })
                .ToList();
            return true;
        });

        return updated ? Ok() : NotFound();
    }
}

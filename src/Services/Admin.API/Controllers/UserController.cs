using Admin.API.Models;
using Admin.API.Stores;
using Microsoft.AspNetCore.Mvc;

namespace Admin.API.Controllers;

[ApiController]
[Route("api/admin/user")]
public sealed class UserController(AdminDataStore store) : ControllerBase
{
    [HttpGet("{id:guid}")]
    public ActionResult<UserModel> GetUserById(Guid id)
    {
        var user = store.Locked(() => store.Users.FirstOrDefault(x => x.Id == id));
        return user is null ? NotFound() : Ok(user);
    }

    [HttpGet("paging")]
    public ActionResult<PageResult<UserModel>> GetAllUsersPaging(string? keyword, int pageIndex = 1, int pageSize = 10)
    {
        var (items, total) = store.Locked(() =>
        {
            var query = store.Users.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(x =>
                    x.FirstName.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                    || x.LastName.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                    || x.UserName.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                    || x.Email.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                    || (x.PhoneNumber?.Contains(keyword, StringComparison.OrdinalIgnoreCase) ?? false));
            }

            var totalRows = query.Count();
            var pageItems = query
                .OrderByDescending(x => x.DateCreated)
                .Skip((Math.Max(pageIndex, 1) - 1) * Math.Max(pageSize, 1))
                .Take(Math.Max(pageSize, 1))
                .ToList();

            return (pageItems, totalRows);
        });

        return Ok(new PageResult<UserModel>
        {
            Results = items,
            CurrentPage = Math.Max(pageIndex, 1),
            PageSize = Math.Max(pageSize, 1),
            RowCount = total
        });
    }

    [HttpPost]
    public IActionResult CreateUser([FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("UserName and Email are required.");
        }

        var created = store.Locked(() =>
        {
            if (store.Users.Any(x => x.UserName.Equals(request.UserName, StringComparison.OrdinalIgnoreCase)))
            {
                return false;
            }

            if (store.Users.Any(x => x.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase)))
            {
                return false;
            }

            store.Users.Add(new UserModel
            {
                UserName = request.UserName.Trim(),
                Email = request.Email.Trim(),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                PhoneNumber = request.PhoneNumber,
                Roles = []
            });

            return true;
        });

        return created ? Ok() : BadRequest("Username or email already exists.");
    }

    [HttpPut("{id:guid}")]
    public IActionResult UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var updated = store.Locked(() =>
        {
            var user = store.Users.FirstOrDefault(x => x.Id == id);
            if (user is null)
            {
                return false;
            }

            user.Email = request.Email.Trim();
            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();
            user.PhoneNumber = request.PhoneNumber;
            return true;
        });

        return updated ? Ok() : NotFound();
    }

    [HttpDelete]
    public IActionResult DeleteUsers([FromQuery] string[] ids)
    {
        store.Locked(() =>
        {
            var parsedIds = ids
                .Select(id => Guid.TryParse(id, out var guid) ? guid : Guid.Empty)
                .Where(id => id != Guid.Empty)
                .ToHashSet();

            store.Users.RemoveAll(user => parsedIds.Contains(user.Id));
        });

        return Ok();
    }

    [HttpPost("password-change-current-user")]
    public IActionResult ChangeMyPassWord([FromBody] ChangeMyPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest("NewPassword is required.");
        }

        return Ok();
    }

    [HttpPost("set-password/{id:guid}")]
    public IActionResult SetPassword(Guid id, [FromBody] SetPasswordRequest request)
    {
        var exists = store.Locked(() => store.Users.Any(x => x.Id == id));
        if (!exists)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest("NewPassword is required.");
        }

        return Ok();
    }

    [HttpPost("change-email/{id:guid}")]
    public IActionResult ChangeEmail(Guid id, [FromBody] ChangeEmailRequest request)
    {
        var updated = store.Locked(() =>
        {
            var user = store.Users.FirstOrDefault(x => x.Id == id);
            if (user is null)
            {
                return false;
            }

            user.Email = request.Email.Trim();
            return true;
        });

        return updated ? Ok() : NotFound();
    }

    [HttpPut("{id}/assign-users")]
    public IActionResult AssignRolesToUser(string id, [FromBody] string[] roles)
    {
        if (!Guid.TryParse(id, out var userId))
        {
            return BadRequest("Invalid user id.");
        }

        var assigned = store.Locked(() =>
        {
            var user = store.Users.FirstOrDefault(x => x.Id == userId);
            if (user is null)
            {
                return false;
            }

            var allowedRoleNames = store.Roles.Select(x => x.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
            user.Roles = roles.Where(role => allowedRoleNames.Contains(role)).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
            return true;
        });

        return assigned ? Ok() : NotFound();
    }
}

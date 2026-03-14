namespace Admin.API.Models;

public sealed class CreateUserRequest
{
    public string UserName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }
}

public sealed class UpdateUserRequest
{
    public string Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }
}

public sealed class SetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}

public sealed class ChangeEmailRequest
{
    public string Email { get; set; } = string.Empty;
}

public sealed class ChangeMyPasswordRequest
{
    public string OldPassword { get; set; } = string.Empty;

    public string NewPassword { get; set; } = string.Empty;
}

public sealed class CreateUpdateRoleRequest
{
    public string Name { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;
}

public sealed class PermissionDto
{
    public string RoleId { get; set; } = string.Empty;

    public List<RoleClaimModel> RoleClaims { get; set; } = [];
}

public sealed class CreateUpdatePostCategoryRequest
{
    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public sealed class CreateUpdatePostRequest
{
    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Summary { get; set; }

    public string? Content { get; set; }

    public Guid CategoryId { get; set; }

    public List<string> Tags { get; set; } = [];
}

public sealed class ReturnBackRequest
{
    public string Reason { get; set; } = string.Empty;
}

public sealed class CreateUpdateSeriesRequest
{
    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public sealed class AddPostSeriesRequest
{
    public Guid SeriesId { get; set; }

    public Guid PostId { get; set; }

    public int SortOrder { get; set; }
}

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

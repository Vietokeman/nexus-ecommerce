namespace Admin.API.Models;

public sealed class PageResult<T>
{
    public IReadOnlyList<T> Results { get; init; } = [];

    public int CurrentPage { get; init; }

    public int RowCount { get; init; }

    public int PageSize { get; init; }
}

public sealed class UserModel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string UserName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public DateTime DateCreated { get; set; } = DateTime.UtcNow;

    public List<string> Roles { get; set; } = [];
}

public sealed class RoleModel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public List<RoleClaimModel> Claims { get; set; } = [];
}

public sealed class RoleClaimModel
{
    public string Type { get; set; } = "permission";

    public string Value { get; set; } = string.Empty;

    public bool Selected { get; set; }
}

public sealed class PermissionCatalog
{
    public static readonly string[] Values =
    [
        "Permissions.Dashboard.View",
        "Permissions.Users.View",
        "Permissions.Users.Create",
        "Permissions.Users.Edit",
        "Permissions.Users.Delete",
        "Permissions.Roles.View",
        "Permissions.Roles.Edit",
        "Permissions.Roles.Delete",
        "Permissions.AuditLogs.View",
        "Permissions.Payments.View",
        "Permissions.Products.View",
        "Permissions.Sellers.View",
        "Permissions.Notifications.View"
    ];
}

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

public sealed class PostCategoryModel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public sealed class PostModel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Summary { get; set; }

    public string? Content { get; set; }

    public Guid CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string Status { get; set; } = "Draft";

    public string AuthorName { get; set; } = "system";

    public DateTime DateCreated { get; set; } = DateTime.UtcNow;

    public DateTime DateModified { get; set; } = DateTime.UtcNow;

    public List<string> Tags { get; set; } = [];

    public List<PostActivityLogModel> ActivityLogs { get; set; } = [];

    public string? ReturnReason { get; set; }
}

public sealed class PostActivityLogModel
{
    public DateTime LoggedAt { get; set; } = DateTime.UtcNow;

    public string Action { get; set; } = string.Empty;

    public string PerformedBy { get; set; } = "system";

    public string? Note { get; set; }
}

public sealed class SeriesModel
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime DateCreated { get; set; } = DateTime.UtcNow;

    public List<SeriesPostModel> Posts { get; set; } = [];
}

public sealed class SeriesPostModel
{
    public Guid PostId { get; set; }

    public int SortOrder { get; set; }
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
        "Permissions.PostCategories.View",
        "Permissions.PostCategories.Create",
        "Permissions.PostCategories.Edit",
        "Permissions.PostCategories.Delete",
        "Permissions.Posts.View",
        "Permissions.Posts.Create",
        "Permissions.Posts.Edit",
        "Permissions.Posts.Delete",
        "Permissions.Posts.Approve",
        "Permissions.Series.View",
        "Permissions.Series.Create",
        "Permissions.Series.Edit",
        "Permissions.Series.Delete"
    ];
}

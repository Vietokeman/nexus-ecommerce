using Admin.API.Models;

namespace Admin.API.Stores;

public sealed class AdminDataStore
{
    private readonly object _gate = new();

    public List<UserModel> Users { get; } = [];

    public List<RoleModel> Roles { get; } = [];

    public List<PostCategoryModel> PostCategories { get; } = [];

    public List<PostModel> Posts { get; } = [];

    public List<SeriesModel> Series { get; } = [];

    public List<NotificationModel> Notifications { get; } = [];

    public AdminDataStore()
    {
        Seed();
    }

    public T Locked<T>(Func<T> action)
    {
        lock (_gate)
        {
            return action();
        }
    }

    public void Locked(Action action)
    {
        lock (_gate)
        {
            action();
        }
    }

    private void Seed()
    {
        var adminRole = new RoleModel
        {
            Name = "admin",
            DisplayName = "Administrator",
            Claims = PermissionCatalog.Values
                .Select(value => new RoleClaimModel { Value = value, Selected = true })
                .ToList()
        };

        var editorRole = new RoleModel
        {
            Name = "editor",
            DisplayName = "Content Editor",
            Claims = PermissionCatalog.Values
                .Where(value => value.Contains("Posts", StringComparison.OrdinalIgnoreCase) || value.Contains("Series", StringComparison.OrdinalIgnoreCase) || value.Contains("PostCategories", StringComparison.OrdinalIgnoreCase))
                .Select(value => new RoleClaimModel { Value = value, Selected = true })
                .ToList()
        };

        Roles.Add(adminRole);
        Roles.Add(editorRole);

        var defaultCategory = new PostCategoryModel
        {
            Name = "General",
            Slug = "general",
            Description = "Default admin content category"
        };

        PostCategories.Add(defaultCategory);

        var rootUser = new UserModel
        {
            UserName = "admin",
            Email = "admin@nexus.local",
            FirstName = "Nexus",
            LastName = "Admin",
            Roles = [adminRole.Name],
            PhoneNumber = "000-000-0000"
        };

        Users.Add(rootUser);

        Posts.Add(new PostModel
        {
            Title = "Welcome to Nexus Admin",
            Slug = "welcome-to-nexus-admin",
            Summary = "Bootstrap post for admin content management",
            Content = "Admin service initialized.",
            CategoryId = defaultCategory.Id,
            CategoryName = defaultCategory.Name,
            AuthorName = rootUser.UserName,
            Tags = ["admin", "nexus"],
            ActivityLogs =
            [
                new PostActivityLogModel
                {
                    Action = "Created",
                    PerformedBy = rootUser.UserName,
                    Note = "Seed data"
                }
            ]
        });

        Series.Add(new SeriesModel
        {
            Name = "Admin Basics",
            Slug = "admin-basics",
            Description = "Seed series for admin content workflow"
        });

        Notifications.Add(new NotificationModel
        {
            Title = "Admin service initialized",
            Message = "Notification center is ready.",
            Link = "/notifications",
            Type = "System"
        });
    }
}

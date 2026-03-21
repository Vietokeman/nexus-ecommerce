using Admin.API.Models;

namespace Admin.API.Stores;

public sealed class AdminDataStore
{
    private readonly object _gate = new();
    private readonly Dictionary<Guid, UserModel> _usersById = [];
    private readonly Dictionary<string, UserModel> _usersByUserName = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, UserModel> _usersByEmail = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<Guid, RoleModel> _rolesById = [];
    private readonly Dictionary<string, RoleModel> _rolesByName = new(StringComparer.OrdinalIgnoreCase);

    public List<UserModel> Users { get; } = [];

    public List<RoleModel> Roles { get; } = [];

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

    public UserModel? FindUserById(Guid id)
    {
        return Locked(() => _usersById.GetValueOrDefault(id));
    }

    public RoleModel? FindRoleById(Guid id)
    {
        return Locked(() => _rolesById.GetValueOrDefault(id));
    }

    public bool ExistsUserName(string userName, Guid? excludedUserId = null)
    {
        return Locked(() =>
        {
            if (!_usersByUserName.TryGetValue(userName.Trim(), out var user))
            {
                return false;
            }

            return !excludedUserId.HasValue || user.Id != excludedUserId.Value;
        });
    }

    public bool ExistsUserEmail(string email, Guid? excludedUserId = null)
    {
        return Locked(() =>
        {
            if (!_usersByEmail.TryGetValue(email.Trim(), out var user))
            {
                return false;
            }

            return !excludedUserId.HasValue || user.Id != excludedUserId.Value;
        });
    }

    public bool ExistsRoleName(string roleName, Guid? excludedRoleId = null)
    {
        return Locked(() =>
        {
            if (!_rolesByName.TryGetValue(roleName.Trim(), out var role))
            {
                return false;
            }

            return !excludedRoleId.HasValue || role.Id != excludedRoleId.Value;
        });
    }

    public void RebuildIndexes()
    {
        Locked(() =>
        {
            _usersById.Clear();
            _usersByUserName.Clear();
            _usersByEmail.Clear();
            _rolesById.Clear();
            _rolesByName.Clear();

            foreach (var user in Users)
            {
                _usersById[user.Id] = user;
                _usersByUserName[user.UserName] = user;
                _usersByEmail[user.Email] = user;
            }

            foreach (var role in Roles)
            {
                _rolesById[role.Id] = role;
                _rolesByName[role.Name] = role;
            }
        });
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

        var operatorRole = new RoleModel
        {
            Name = "operator",
            DisplayName = "Operations",
            Claims = PermissionCatalog.Values
                .Where(value =>
                    value.Contains("Dashboard", StringComparison.OrdinalIgnoreCase)
                    || value.Contains("Users", StringComparison.OrdinalIgnoreCase)
                    || value.Contains("Roles", StringComparison.OrdinalIgnoreCase)
                    || value.Contains("AuditLogs", StringComparison.OrdinalIgnoreCase)
                    || value.Contains("Payments", StringComparison.OrdinalIgnoreCase)
                    || value.Contains("Products", StringComparison.OrdinalIgnoreCase)
                    || value.Contains("Sellers", StringComparison.OrdinalIgnoreCase)
                    || value.Contains("Notifications", StringComparison.OrdinalIgnoreCase))
                .Select(value => new RoleClaimModel { Value = value, Selected = true })
                .ToList()
        };

        Roles.Add(adminRole);
        Roles.Add(operatorRole);

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

        Notifications.Add(new NotificationModel
        {
            Title = "Admin service initialized",
            Message = "Notification center is ready.",
            Link = "/notifications",
            Type = "System"
        });

        RebuildIndexes();
    }
}

namespace Identity.API.Entities;

/// <summary>
/// Custom permission entity for fine-grained access control (used with Dapper).
/// </summary>
public class Permission
{
    public int Id { get; set; }
    public string Function { get; set; } = string.Empty; // e.g., "product", "order"
    public string Command { get; set; } = string.Empty;  // e.g., "read", "write", "delete"
    public string RoleId { get; set; } = string.Empty;
}

/// <summary>
/// Maps roles to permissions
/// </summary>
public class RolePermission
{
    public int Id { get; set; }
    public string RoleId { get; set; } = string.Empty;
    public int PermissionId { get; set; }
}

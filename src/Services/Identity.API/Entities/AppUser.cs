using Microsoft.AspNetCore.Identity;

namespace Identity.API.Entities;

/// <summary>
/// Custom application user extending IdentityUser.
/// </summary>
public class AppUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
}

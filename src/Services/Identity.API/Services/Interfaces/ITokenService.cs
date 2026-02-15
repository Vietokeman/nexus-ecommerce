using Identity.API.Entities;

namespace Identity.API.Services.Interfaces;

/// <summary>
/// JWT token generation & validation service
/// </summary>
public interface ITokenService
{
    string GenerateAccessToken(AppUser user, IList<string> roles);
    string GenerateRefreshToken();
    bool ValidateRefreshToken(string token);
}

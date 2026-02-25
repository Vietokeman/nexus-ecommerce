using System.Security.Claims;
using Identity.API.DTOs;
using Identity.API.Entities;
using Identity.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/auth")]
public class ExternalAuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly ILogger<ExternalAuthController> _logger;
    private readonly IConfiguration _configuration;

    public ExternalAuthController(
        UserManager<AppUser> userManager,
        ITokenService tokenService,
        ILogger<ExternalAuthController> logger,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// GET /api/auth/external-login?provider=Google|GitHub
    /// Redirects the user to the external OAuth provider login page.
    /// </summary>
    [HttpGet("external-login")]
    public IActionResult ExternalLogin([FromQuery] string provider, [FromQuery] string? returnUrl = null)
    {
        var callbackUrl = Url.Action(nameof(ExternalLoginCallback), "ExternalAuth",
            new { returnUrl }, Request.Scheme);

        var properties = new AuthenticationProperties
        {
            RedirectUri = callbackUrl,
            Items = { { "LoginProvider", provider } }
        };

        return Challenge(properties, provider);
    }

    /// <summary>
    /// GET /api/auth/external-login-callback
    /// Handles the callback from OAuth provider, finds or creates user, and redirects to FE with JWT.
    /// </summary>
    [HttpGet("external-login-callback")]
    public async Task<IActionResult> ExternalLoginCallback([FromQuery] string? returnUrl = null)
    {
        var info = await HttpContext.AuthenticateAsync("ExternalCookies");
        if (!info.Succeeded || info.Principal == null)
        {
            _logger.LogWarning("External authentication failed");
            return RedirectToFrontend(returnUrl, error: "External login failed");
        }

        var claims = info.Principal.Claims.ToList();
        var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        var name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
        var providerKey = claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        var provider = info.Properties?.Items["LoginProvider"] ?? "Unknown";

        if (string.IsNullOrEmpty(email))
        {
            _logger.LogWarning("Email not provided by {Provider}", provider);
            return RedirectToFrontend(returnUrl, error: "Email not provided by external provider");
        }

        // Find or create user
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            // Parse first/last name from full name
            var nameParts = (name ?? email.Split('@')[0]).Split(' ', 2);
            var firstName = nameParts[0];
            var lastName = nameParts.Length > 1 ? nameParts[1] : string.Empty;

            user = new AppUser
            {
                UserName = email,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                EmailConfirmed = true, // OAuth provider already verified
                IsAdmin = false,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                _logger.LogError("Failed to create user for {Provider}: {Errors}", provider, errors);
                return RedirectToFrontend(returnUrl, error: "Failed to create account");
            }

            await _userManager.AddToRoleAsync(user, "User");
            _logger.LogInformation("Created new user {Email} via {Provider}", email, provider);
        }

        // Add external login if not already linked
        var logins = await _userManager.GetLoginsAsync(user);
        if (!logins.Any(l => l.LoginProvider == provider && l.ProviderKey == providerKey))
        {
            await _userManager.AddLoginAsync(user,
                new UserLoginInfo(provider, providerKey ?? "", provider));
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Generate JWT tokens
        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        _logger.LogInformation("User {Email} logged in via {Provider}", email, provider);

        // Clean up external cookie
        await HttpContext.SignOutAsync("ExternalCookies");

        // Redirect to frontend with tokens
        return RedirectToFrontend(returnUrl, accessToken, refreshToken, user);
    }

    /// <summary>
    /// GET /api/auth/external-providers
    /// Returns the list of configured external OAuth providers.
    /// </summary>
    [HttpGet("external-providers")]
    public IActionResult GetExternalProviders()
    {
        var providers = new List<object>();

        var googleId = _configuration["OAuthSettings:Google:ClientId"];
        if (!string.IsNullOrEmpty(googleId))
            providers.Add(new { name = "Google", displayName = "Google" });

        var githubId = _configuration["OAuthSettings:GitHub:ClientId"];
        if (!string.IsNullOrEmpty(githubId))
            providers.Add(new { name = "GitHub", displayName = "GitHub" });

        return Ok(new { providers });
    }

    private IActionResult RedirectToFrontend(
        string? returnUrl,
        string? accessToken = null,
        string? refreshToken = null,
        AppUser? user = null,
        string? error = null)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
        var callbackPath = "/auth/callback";

        if (!string.IsNullOrEmpty(error))
        {
            return Redirect($"{frontendUrl}{callbackPath}?error={Uri.EscapeDataString(error)}");
        }

        var queryParams = new List<string>
        {
            $"token={Uri.EscapeDataString(accessToken!)}",
            $"refreshToken={Uri.EscapeDataString(refreshToken!)}"
        };

        if (user != null)
        {
            queryParams.Add($"userId={Uri.EscapeDataString(user.Id)}");
            queryParams.Add($"email={Uri.EscapeDataString(user.Email ?? "")}");
            queryParams.Add($"firstName={Uri.EscapeDataString(user.FirstName)}");
            queryParams.Add($"lastName={Uri.EscapeDataString(user.LastName)}");
            queryParams.Add($"isAdmin={user.IsAdmin.ToString().ToLower()}");
            queryParams.Add($"isVerified={user.EmailConfirmed.ToString().ToLower()}");
        }

        if (!string.IsNullOrEmpty(returnUrl))
            queryParams.Add($"returnUrl={Uri.EscapeDataString(returnUrl)}");

        var redirectUrl = $"{frontendUrl}{callbackPath}?{string.Join("&", queryParams)}";
        return Redirect(redirectUrl);
    }
}

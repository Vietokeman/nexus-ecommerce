using Identity.API.DTOs;
using Identity.API.Entities;
using Identity.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly IIdentityEmailService _emailService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        ITokenService tokenService,
        IIdentityEmailService emailService,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// POST /api/auth/register — Register a new user
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterDto dto)
    {
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            return BadRequest(new AuthResponse { Success = false, Message = "Email already registered" });

        var user = new AppUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            EmailConfirmed = false // require email confirmation
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new AuthResponse { Success = false, Message = errors });
        }

        // Assign default role
        await _userManager.AddToRoleAsync(user, "User");

        // Generate email confirmation token
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var confirmationLink = $"{Request.Scheme}://{Request.Host}/api/auth/confirm-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";

        try
        {
            await _emailService.SendConfirmationEmailAsync(user.Email, user.FirstName, confirmationLink);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send confirmation email to {Email}, continuing registration", user.Email);
        }

        // Generate tokens
        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        _logger.LogInformation("User {Email} registered successfully", user.Email);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Registration successful. Please check your email to confirm your account.",
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = MapToDto(user)
        });
    }

    /// <summary>
    /// POST /api/auth/login — Login with email & password
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return Unauthorized(new AuthResponse { Success = false, Message = "Invalid email or password" });

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
                return Unauthorized(new AuthResponse { Success = false, Message = "Account locked out. Try again later." });

            return Unauthorized(new AuthResponse { Success = false, Message = "Invalid email or password" });
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        _logger.LogInformation("User {Email} logged in", user.Email);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Login successful",
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = MapToDto(user)
        });
    }

    /// <summary>
    /// POST /api/auth/refresh-token — Refresh access token
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenDto dto)
    {
        if (!_tokenService.ValidateRefreshToken(dto.RefreshToken))
            return Unauthorized(new AuthResponse { Success = false, Message = "Invalid refresh token" });

        // In production: look up refresh token in DB, get associated user
        // For now, return a generic response
        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Token refreshed — implement DB lookup for production"
        });
    }

    /// <summary>
    /// GET /api/auth/confirm-email — Confirm email address
    /// </summary>
    [HttpGet("confirm-email")]
    public async Task<ActionResult<AuthResponse>> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound(new AuthResponse { Success = false, Message = "User not found" });

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (!result.Succeeded)
            return BadRequest(new AuthResponse { Success = false, Message = "Invalid confirmation token" });

        _logger.LogInformation("Email confirmed for user {Email}", user.Email);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Email confirmed successfully",
            User = MapToDto(user)
        });
    }

    /// <summary>
    /// POST /api/auth/forgot-password — Send password reset email
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<ActionResult<AuthResponse>> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
        {
            // Don't reveal that the user doesn't exist
            return Ok(new AuthResponse { Success = true, Message = "If the email exists, a reset link has been sent." });
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var resetLink = $"http://localhost:3000/reset-password/{user.Id}/{Uri.EscapeDataString(token)}";

        try
        {
            await _emailService.SendPasswordResetEmailAsync(user.Email!, user.FirstName, resetLink);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", user.Email);
        }

        return Ok(new AuthResponse { Success = true, Message = "If the email exists, a reset link has been sent." });
    }

    /// <summary>
    /// POST /api/auth/reset-password — Reset password
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<ActionResult<AuthResponse>> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(dto.UserId);
        if (user == null)
            return NotFound(new AuthResponse { Success = false, Message = "User not found" });

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new AuthResponse { Success = false, Message = errors });
        }

        _logger.LogInformation("Password reset for user {Email}", user.Email);

        return Ok(new AuthResponse { Success = true, Message = "Password reset successful" });
    }

    /// <summary>
    /// GET /api/auth/me — Get current user info (requires Bearer token)
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponse>> Me()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new AuthResponse { Success = false, Message = "Not authenticated" });

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound(new AuthResponse { Success = false, Message = "User not found" });

        return Ok(new AuthResponse
        {
            Success = true,
            User = MapToDto(user)
        });
    }

    private static UserDto MapToDto(AppUser user) => new()
    {
        Id = user.Id,
        UserName = user.UserName ?? string.Empty,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email ?? string.Empty,
        IsVerified = user.EmailConfirmed,
        IsAdmin = user.IsAdmin
    };
}

namespace Identity.API.Services.Interfaces;

/// <summary>
/// Email service for Identity — confirmation, password reset, etc.
/// </summary>
public interface IIdentityEmailService
{
    Task SendConfirmationEmailAsync(string to, string userName, string confirmationLink);
    Task SendPasswordResetEmailAsync(string to, string userName, string resetLink);
}

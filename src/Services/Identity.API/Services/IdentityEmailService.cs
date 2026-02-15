using Identity.API.Configuration;
using Identity.API.Services.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Identity.API.Services;

/// <summary>
/// Email service for Identity-related emails — confirmation, password reset.
/// </summary>
public class IdentityEmailService : IIdentityEmailService
{
    private readonly SmtpSettings _smtpSettings;
    private readonly ILogger<IdentityEmailService> _logger;

    public IdentityEmailService(IOptions<SmtpSettings> smtpSettings, ILogger<IdentityEmailService> logger)
    {
        _smtpSettings = smtpSettings.Value;
        _logger = logger;
    }

    public async Task SendConfirmationEmailAsync(string to, string userName, string confirmationLink)
    {
        var subject = "Confirm your email — Distributed E-Commerce";
        var body = $@"
            <html>
            <body style='font-family: Poppins, sans-serif; background: #f5f5f5; padding: 20px;'>
                <div style='max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px;'>
                    <h2 style='color: #333;'>Welcome, {userName}!</h2>
                    <p>Please confirm your email address to activate your account.</p>
                    <a href='{confirmationLink}'
                       style='display: inline-block; background: #DB4444; color: white; padding: 12px 24px;
                              border-radius: 4px; text-decoration: none; margin-top: 16px;'>
                        Confirm Email
                    </a>
                    <p style='color: #999; margin-top: 24px; font-size: 12px;'>
                        If you didn't create an account, please ignore this email.
                    </p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendPasswordResetEmailAsync(string to, string userName, string resetLink)
    {
        var subject = "Reset your password — Distributed E-Commerce";
        var body = $@"
            <html>
            <body style='font-family: Poppins, sans-serif; background: #f5f5f5; padding: 20px;'>
                <div style='max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px;'>
                    <h2 style='color: #333;'>Hi {userName},</h2>
                    <p>We received a request to reset your password.</p>
                    <a href='{resetLink}'
                       style='display: inline-block; background: #DB4444; color: white; padding: 12px 24px;
                              border-radius: 4px; text-decoration: none; margin-top: 16px;'>
                        Reset Password
                    </a>
                    <p style='color: #999; margin-top: 24px; font-size: 12px;'>
                        If you didn't request a password reset, please ignore this email.
                    </p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(to, subject, body);
    }

    private async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_smtpSettings.DisplayName, _smtpSettings.UserName));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlBody };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_smtpSettings.UserName, _smtpSettings.Password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("Email sent to {To} — Subject: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
            throw;
        }
    }
}

using Hangfire.API.Services.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Hangfire.API.Services;

/// <summary>
/// Sends scheduled emails using MailKit / Google SMTP
/// </summary>
public class ScheduledEmailService : IScheduledEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<ScheduledEmailService> _logger;

    public ScheduledEmailService(IConfiguration configuration, ILogger<ScheduledEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendReminderEmailAsync(string to, string subject, string body)
    {
        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(
                _configuration["SmtpSettings:DisplayName"] ?? "Distributed E-Commerce",
                _configuration["SmtpSettings:UserName"] ?? "noreply@ecommerce.com"));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = body };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(
                _configuration["SmtpSettings:Host"] ?? "smtp.gmail.com",
                int.Parse(_configuration["SmtpSettings:Port"] ?? "587"),
                SecureSocketOptions.StartTls);

            await smtp.AuthenticateAsync(
                _configuration["SmtpSettings:UserName"] ?? "",
                _configuration["SmtpSettings:Password"] ?? "");

            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("Reminder email sent to {To} — Subject: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send reminder email to {To}", to);
            throw;
        }
    }

    public async Task SendAbandonedCartEmailAsync(string to, string userName, int itemCount)
    {
        var subject = "You left items in your cart!";
        var body = $@"
            <html>
            <body style='font-family: Poppins, sans-serif; background: #f5f5f5; padding: 20px;'>
                <div style='max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px;'>
                    <h2 style='color: #333;'>Hi {userName},</h2>
                    <p>You have <strong>{itemCount}</strong> item(s) waiting in your cart.</p>
                    <p>Complete your purchase before they sell out!</p>
                    <a href='http://localhost:3000/cart'
                       style='display: inline-block; background: #DB4444; color: white; padding: 12px 24px;
                              border-radius: 4px; text-decoration: none; margin-top: 16px;'>
                        Complete Purchase
                    </a>
                    <p style='color: #999; margin-top: 24px; font-size: 12px;'>
                        Distributed E-Commerce Platform
                    </p>
                </div>
            </body>
            </html>";

        await SendReminderEmailAsync(to, subject, body);
    }
}

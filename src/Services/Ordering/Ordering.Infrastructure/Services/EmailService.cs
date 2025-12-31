using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using Ordering.Application.Common.Interfaces;
using Ordering.Infrastructure.Configurations;

namespace Ordering.Infrastructure.Services
{
    /// <summary>
    /// Email service implementation using MailKit for Google SMTP
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value ?? throw new ArgumentNullException(nameof(emailSettings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> SendEmailAsync(EmailRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                // Create email message
                var email = new MimeMessage();
                
                // From
                email.From.Add(new MailboxAddress(
                    _emailSettings.DisplayName, 
                    request.From ?? _emailSettings.FromEmail));
                
                // To
                email.To.Add(MailboxAddress.Parse(request.To));
                
                // Subject
                email.Subject = request.Subject;
                
                // Body
                var builder = new BodyBuilder();
                if (request.IsHtml)
                {
                    builder.HtmlBody = request.Body;
                }
                else
                {
                    builder.TextBody = request.Body;
                }
                email.Body = builder.ToMessageBody();

                // Send email using MailKit
                using var smtp = new SmtpClient();
                
                // Connect to SMTP server
                await smtp.ConnectAsync(
                    _emailSettings.SmtpServer, 
                    _emailSettings.SmtpPort, 
                    SecureSocketOptions.StartTls, 
                    cancellationToken);
                
                // Authenticate
                await smtp.AuthenticateAsync(
                    _emailSettings.Username, 
                    _emailSettings.Password, 
                    cancellationToken);
                
                // Send
                await smtp.SendAsync(email, cancellationToken);
                
                // Disconnect
                await smtp.DisconnectAsync(true, cancellationToken);

                _logger.LogInformation("Email sent successfully to {To}", request.To);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {To}", request.To);
                return false;
            }
        }
    }
}

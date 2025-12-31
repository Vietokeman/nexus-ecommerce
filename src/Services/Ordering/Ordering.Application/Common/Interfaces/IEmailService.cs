namespace Ordering.Application.Common.Interfaces
{
    /// <summary>
    /// Interface for email service to send emails (e.g., order confirmations)
    /// </summary>
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(EmailRequest request, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Email request model
    /// </summary>
    public class EmailRequest
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? From { get; set; }
        public bool IsHtml { get; set; } = true;
    }
}

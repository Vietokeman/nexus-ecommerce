namespace Hangfire.API.Services.Interfaces;

/// <summary>
/// Service for sending scheduled emails (reminders, notifications)
/// </summary>
public interface IScheduledEmailService
{
    Task SendReminderEmailAsync(string to, string subject, string body);
    Task SendAbandonedCartEmailAsync(string to, string userName, int itemCount);
}

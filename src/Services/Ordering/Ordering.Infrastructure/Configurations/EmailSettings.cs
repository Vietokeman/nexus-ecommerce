namespace Ordering.Infrastructure.Configurations
{
    /// <summary>
    /// Email settings for Google SMTP
    /// </summary>
    public class EmailSettings
    {
        public const string SectionName = "EmailSettings";
        
        /// <summary>
        /// SMTP Server hostname (e.g., smtp.gmail.com)
        /// </summary>
        public string SmtpServer { get; set; } = "smtp.gmail.com";
        
        /// <summary>
        /// SMTP Port (587 for TLS, 465 for SSL)
        /// </summary>
        public int SmtpPort { get; set; } = 587;
        
        /// <summary>
        /// Email address used for authentication
        /// </summary>
        public string Username { get; set; } = string.Empty;
        
        /// <summary>
        /// App Password (for Gmail, generate from Google Account Security)
        /// </summary>
        public string Password { get; set; } = string.Empty;
        
        /// <summary>
        /// Display name for emails
        /// </summary>
        public string DisplayName { get; set; } = "Order Service";
        
        /// <summary>
        /// From email address
        /// </summary>
        public string FromEmail { get; set; } = string.Empty;
        
        /// <summary>
        /// Enable SSL/TLS
        /// </summary>
        public bool EnableSsl { get; set; } = true;
    }
}

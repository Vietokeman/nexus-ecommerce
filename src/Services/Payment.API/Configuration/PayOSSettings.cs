namespace Payment.API.Configuration;

public class PayOSSettings
{
    public string ClientId { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ChecksumKey { get; set; } = string.Empty;
    public string WebReturnUrl { get; set; } = string.Empty;
    public string WebCancelUrl { get; set; } = string.Empty;
    public string MobileReturnUrl { get; set; } = string.Empty;
    public string MobileCancelUrl { get; set; } = string.Empty;
    public string WebhookUrl { get; set; } = string.Empty;
}

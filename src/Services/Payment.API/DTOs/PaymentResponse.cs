namespace Payment.API.DTOs;

public record PaymentResponse
{
    public string OrderNo { get; init; } = string.Empty;
    public long OrderCode { get; init; }
    public string PaymentUrl { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
}

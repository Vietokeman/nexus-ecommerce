namespace Payment.API.DTOs;

public record PaymentStatusResponse
{
    public string OrderNo { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public DateTime? PaidAt { get; init; }
    public string? PaymentMethod { get; init; }
}

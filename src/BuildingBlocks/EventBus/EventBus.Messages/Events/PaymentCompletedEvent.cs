namespace EventBus.Messages.Events;

/// <summary>
/// Integration event published when a payment is successfully completed via PayOS.
/// Consumed by Ordering.API to update order status to Paid.
/// </summary>
public record PaymentCompletedEvent : IntegrationBaseEvent
{
    public string OrderNo { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public DateTime PaidAt { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;
    public string TransactionId { get; init; } = string.Empty;
}

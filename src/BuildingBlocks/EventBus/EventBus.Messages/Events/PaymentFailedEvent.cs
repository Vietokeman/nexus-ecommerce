namespace EventBus.Messages.Events;

/// <summary>
/// Integration event published when a payment fails or is cancelled.
/// </summary>
public record PaymentFailedEvent : IntegrationBaseEvent
{
    public string OrderNo { get; init; } = string.Empty;
    public string Reason { get; init; } = string.Empty;
    public decimal Amount { get; init; }
}

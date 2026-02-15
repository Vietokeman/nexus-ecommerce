namespace Payment.API.Entities;

/// <summary>
/// Represents a payment transaction tracked in the system.
/// Maps to the PaymentTransactions table in SQL Server.
/// </summary>
public class PaymentTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>PayOS unique order code (bigint)</summary>
    public long OrderCode { get; set; }

    /// <summary>Internal order reference number</summary>
    public string OrderNo { get; set; } = string.Empty;

    /// <summary>User who initiated the payment</summary>
    public string UserId { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string Currency { get; set; } = "VND";

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    /// <summary>PayOS checkout URL for user redirect</summary>
    public string? PaymentUrl { get; set; }

    /// <summary>PayOS transaction reference after payment</summary>
    public string? PayOSTransactionId { get; set; }

    public string? PaymentMethod { get; set; }

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? PaidAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    public string? CancellationReason { get; set; }

    /// <summary>Raw webhook JSON for audit trail</summary>
    public string? WebhookData { get; set; }
}

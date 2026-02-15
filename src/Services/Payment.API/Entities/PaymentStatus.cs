namespace Payment.API.Entities;

public enum PaymentStatus
{
    Pending = 0,
    Processing = 1,
    Paid = 2,
    Cancelled = 3,
    Failed = 4,
    Refunded = 5
}

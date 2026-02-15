using System.ComponentModel.DataAnnotations;

namespace Payment.API.DTOs;

public record CreatePaymentRequest
{
    [Required]
    public string OrderNo { get; init; } = string.Empty;

    [Required]
    [Range(1000, int.MaxValue, ErrorMessage = "Amount must be at least 1000 VND")]
    public decimal Amount { get; init; }

    [Required]
    [MaxLength(500)]
    public string Description { get; init; } = string.Empty;

    public string? BuyerName { get; init; }
    public string? BuyerEmail { get; init; }
    public string? BuyerPhone { get; init; }

    public List<PaymentItemDto> Items { get; init; } = new();

    public string? ReturnUrl { get; init; }
    public string? CancelUrl { get; init; }
}

public record PaymentItemDto
{
    [Required]
    public string Name { get; init; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantity { get; init; }

    [Range(1, int.MaxValue)]
    public int Price { get; init; } // PayOS uses int (VND)
}

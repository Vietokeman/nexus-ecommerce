using Payment.API.DTOs;

namespace Payment.API.Services.Interfaces;

public interface IPaymentService
{
    Task<PaymentResponse> CreatePaymentAsync(CreatePaymentRequest request, string userId);
    Task<PaymentStatusResponse?> GetPaymentStatusAsync(string orderNo);
    Task<PaymentStatusResponse?> GetPaymentStatusByCodeAsync(long orderCode);
    Task HandleWebhookAsync(Net.payOS.Types.WebhookType webhookData);
    Task<bool> CancelPaymentAsync(string orderNo, string userId);
    Task<List<PaymentStatusResponse>> GetUserPaymentsAsync(string userId);
}

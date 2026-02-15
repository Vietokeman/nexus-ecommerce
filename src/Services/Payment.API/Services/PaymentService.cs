using MassTransit;
using Microsoft.Extensions.Options;
using Net.payOS;
using Net.payOS.Types;
using Payment.API.Configuration;
using Payment.API.DTOs;
using Payment.API.Entities;
using Payment.API.Repositories.Interfaces;
using Payment.API.Services.Interfaces;
using EventBus.Messages.Events;

namespace Payment.API.Services;

public class PaymentService : IPaymentService
{
    private readonly PayOS _payOS;
    private readonly PayOSSettings _settings;
    private readonly IPaymentRepository _repository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        IOptions<PayOSSettings> settings,
        IPaymentRepository repository,
        IPublishEndpoint publishEndpoint,
        ILogger<PaymentService> logger)
    {
        _settings = settings.Value;
        _repository = repository;
        _publishEndpoint = publishEndpoint;
        _logger = logger;
        _payOS = new PayOS(_settings.ClientId, _settings.ApiKey, _settings.ChecksumKey);
    }

    public async Task<PaymentResponse> CreatePaymentAsync(CreatePaymentRequest request, string userId)
    {
        // Generate unique order code for PayOS (must be unique bigint)
        var orderCode = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // Map items to PayOS format
        var items = request.Items
            .Select(i => new ItemData(i.Name, i.Quantity, i.Price))
            .ToList();

        // Create PayOS payment link
        var paymentData = new PaymentData(
            orderCode: orderCode,
            amount: (int)request.Amount,
            description: request.Description.Length > 25
                ? request.Description[..25]
                : request.Description,
            items: items,
            cancelUrl: request.CancelUrl ?? _settings.WebCancelUrl,
            returnUrl: request.ReturnUrl ?? _settings.WebReturnUrl,
            buyerName: request.BuyerName,
            buyerEmail: request.BuyerEmail,
            buyerPhone: request.BuyerPhone
        );

        var createPaymentResult = await _payOS.createPaymentLink(paymentData);

        // Save transaction to DB
        var transaction = new PaymentTransaction
        {
            OrderCode = orderCode,
            OrderNo = request.OrderNo,
            UserId = userId,
            Amount = request.Amount,
            Status = PaymentStatus.Pending,
            PaymentUrl = createPaymentResult.checkoutUrl,
            Description = request.Description
        };

        await _repository.CreateAsync(transaction);

        _logger.LogInformation(
            "Payment link created for Order {OrderNo}, PayOS OrderCode: {OrderCode}, URL: {Url}",
            request.OrderNo, orderCode, createPaymentResult.checkoutUrl);

        return new PaymentResponse
        {
            OrderNo = request.OrderNo,
            OrderCode = orderCode,
            PaymentUrl = createPaymentResult.checkoutUrl,
            Status = "Pending"
        };
    }

    public async Task<PaymentStatusResponse?> GetPaymentStatusAsync(string orderNo)
    {
        var transaction = await _repository.GetByOrderNoAsync(orderNo);
        if (transaction == null) return null;

        return MapToStatusResponse(transaction);
    }

    public async Task<PaymentStatusResponse?> GetPaymentStatusByCodeAsync(long orderCode)
    {
        var transaction = await _repository.GetByOrderCodeAsync(orderCode);
        if (transaction == null) return null;

        // Also check PayOS for latest status
        try
        {
            var payosInfo = await _payOS.getPaymentLinkInformation(orderCode);
            if (payosInfo.status == "PAID" && transaction.Status != PaymentStatus.Paid)
            {
                transaction.Status = PaymentStatus.Paid;
                transaction.PaidAt = DateTime.UtcNow;
                await _repository.UpdateAsync(transaction);
            }
            else if (payosInfo.status == "CANCELLED" && transaction.Status == PaymentStatus.Pending)
            {
                transaction.Status = PaymentStatus.Cancelled;
                transaction.CancelledAt = DateTime.UtcNow;
                await _repository.UpdateAsync(transaction);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to check PayOS status for OrderCode {OrderCode}", orderCode);
        }

        return MapToStatusResponse(transaction);
    }

    public async Task HandleWebhookAsync(WebhookType webhookData)
    {
        // Verify webhook signature
        var verifiedData = _payOS.verifyPaymentWebhookData(webhookData);

        _logger.LogInformation(
            "PayOS Webhook received: OrderCode={OrderCode}, Code={Code}",
            verifiedData.orderCode, verifiedData.code);

        var transaction = await _repository.GetByOrderCodeAsync(verifiedData.orderCode);
        if (transaction == null)
        {
            _logger.LogWarning("Transaction not found for OrderCode {OrderCode}", verifiedData.orderCode);
            return;
        }

        // Update status based on webhook
        if (verifiedData.code == "00") // Success
        {
            transaction.Status = PaymentStatus.Paid;
            transaction.PaidAt = DateTime.UtcNow;
            transaction.PayOSTransactionId = verifiedData.transactionDateTime;
            transaction.WebhookData = System.Text.Json.JsonSerializer.Serialize(verifiedData);

            await _repository.UpdateAsync(transaction);

            // Publish PaymentCompletedEvent to RabbitMQ
            await _publishEndpoint.Publish(new PaymentCompletedEvent
            {
                OrderNo = transaction.OrderNo,
                Amount = transaction.Amount,
                PaidAt = transaction.PaidAt.Value,
                PaymentMethod = "PayOS",
                TransactionId = transaction.OrderCode.ToString()
            });

            _logger.LogInformation("Payment completed for Order {OrderNo}", transaction.OrderNo);
        }
        else // Failed or cancelled
        {
            transaction.Status = PaymentStatus.Failed;
            transaction.CancellationReason = $"PayOS code: {verifiedData.code}";
            transaction.WebhookData = System.Text.Json.JsonSerializer.Serialize(verifiedData);

            await _repository.UpdateAsync(transaction);

            _logger.LogWarning("Payment failed for Order {OrderNo}, code: {Code}",
                transaction.OrderNo, verifiedData.code);
        }
    }

    public async Task<bool> CancelPaymentAsync(string orderNo, string userId)
    {
        var transaction = await _repository.GetByOrderNoAsync(orderNo);
        if (transaction == null || transaction.UserId != userId) return false;
        if (transaction.Status != PaymentStatus.Pending) return false;

        try
        {
            await _payOS.cancelPaymentLink(transaction.OrderCode);
            transaction.Status = PaymentStatus.Cancelled;
            transaction.CancelledAt = DateTime.UtcNow;
            transaction.CancellationReason = "Cancelled by user";
            await _repository.UpdateAsync(transaction);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cancel payment for {OrderNo}", orderNo);
            return false;
        }
    }

    public async Task<List<PaymentStatusResponse>> GetUserPaymentsAsync(string userId)
    {
        var transactions = await _repository.GetByUserIdAsync(userId);
        return transactions.Select(MapToStatusResponse).ToList();
    }

    private static PaymentStatusResponse MapToStatusResponse(PaymentTransaction transaction)
    {
        return new PaymentStatusResponse
        {
            OrderNo = transaction.OrderNo,
            Status = transaction.Status.ToString(),
            Amount = transaction.Amount,
            PaidAt = transaction.PaidAt,
            PaymentMethod = transaction.PaymentMethod
        };
    }
}

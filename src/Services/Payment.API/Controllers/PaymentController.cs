using Microsoft.AspNetCore.Mvc;
using Net.payOS.Types;
using Payment.API.DTOs;
using Payment.API.Services.Interfaces;
using Shared.SeedWork;

namespace Payment.API.Controllers;

[ApiController]
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(IPaymentService paymentService, ILogger<PaymentController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>Create a PayOS payment link for an order</summary>
    [HttpPost("create")]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        // In production, extract userId from JWT claims
        // For now, use a header or default
        var userId = Request.Headers["X-User-Id"].FirstOrDefault() ?? "anonymous";

        try
        {
            var result = await _paymentService.CreatePaymentAsync(request, userId);
            return Ok(new ApiSuccessResult<PaymentResponse>(result, "Payment link created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create payment for Order {OrderNo}", request.OrderNo);
            return BadRequest(new ApiErrorResult<PaymentResponse>($"Failed to create payment: {ex.Message}"));
        }
    }

    /// <summary>Get payment status by order number</summary>
    [HttpGet("{orderNo}/status")]
    public async Task<IActionResult> GetPaymentStatus(string orderNo)
    {
        var result = await _paymentService.GetPaymentStatusAsync(orderNo);
        if (result == null)
            return NotFound(new ApiErrorResult<PaymentStatusResponse>("Payment not found"));

        return Ok(new ApiSuccessResult<PaymentStatusResponse>(result));
    }

    /// <summary>Get payment status by PayOS order code</summary>
    [HttpGet("code/{orderCode:long}/status")]
    public async Task<IActionResult> GetPaymentStatusByCode(long orderCode)
    {
        var result = await _paymentService.GetPaymentStatusByCodeAsync(orderCode);
        if (result == null)
            return NotFound(new ApiErrorResult<PaymentStatusResponse>("Payment not found"));

        return Ok(new ApiSuccessResult<PaymentStatusResponse>(result));
    }

    /// <summary>PayOS webhook callback — no auth required</summary>
    [HttpPost("payos-callback")]
    public async Task<IActionResult> PayOSCallback([FromBody] WebhookType webhookData)
    {
        _logger.LogInformation("PayOS webhook received");
        try
        {
            await _paymentService.HandleWebhookAsync(webhookData);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PayOS webhook processing failed");
            return Ok(); // Always return 200 to PayOS to prevent retry storm
        }
    }

    /// <summary>Cancel a pending payment</summary>
    [HttpPost("cancel/{orderNo}")]
    public async Task<IActionResult> CancelPayment(string orderNo)
    {
        var userId = Request.Headers["X-User-Id"].FirstOrDefault() ?? "anonymous";
        var result = await _paymentService.CancelPaymentAsync(orderNo, userId);

        return result
            ? Ok(new ApiSuccessResult<bool>(true, "Payment cancelled"))
            : BadRequest(new ApiErrorResult<bool>("Cannot cancel this payment"));
    }

    /// <summary>Get all payments for a user</summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserPayments(string userId)
    {
        var result = await _paymentService.GetUserPaymentsAsync(userId);
        return Ok(new ApiSuccessResult<List<PaymentStatusResponse>>(result));
    }
}

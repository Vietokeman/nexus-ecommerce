using MediatR;
using Microsoft.Extensions.Logging;
using Ordering.Application.Common.Interfaces;
using Ordering.Domain.Events;

namespace Ordering.Application.Features.V1.Orders.EventHandlers
{
    /// <summary>
    /// Domain event handler that runs when an order is created.
    /// Sends a confirmation email to the customer.
    /// </summary>
    public class OrderCreatedEventHandler : INotificationHandler<OrderCreatedEvent>
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<OrderCreatedEventHandler> _logger;

        public OrderCreatedEventHandler(
            IEmailService emailService,
            ILogger<OrderCreatedEventHandler> logger)
        {
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task Handle(OrderCreatedEvent notification, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Domain Event: {DomainEvent} handled for OrderId: {OrderId}", 
                notification.GetType().Name, notification.Order.Id);

            var order = notification.Order;
            
            // Send confirmation email
            var emailRequest = new EmailRequest
            {
                To = order.EmailAdress,
                Subject = $"Order Confirmation - Order #{order.Id}",
                Body = GenerateOrderConfirmationEmail(order),
                IsHtml = true
            };

            var result = await _emailService.SendEmailAsync(emailRequest, cancellationToken);
            
            if (result)
            {
                _logger.LogInformation("Order confirmation email sent successfully for OrderId: {OrderId}", order.Id);
            }
            else
            {
                _logger.LogWarning("Failed to send order confirmation email for OrderId: {OrderId}", order.Id);
            }
        }

        private static string GenerateOrderConfirmationEmail(Domain.Entities.Order order)
        {
            return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #4CAF50; color: white; padding: 10px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .order-details {{ background-color: #f9f9f9; padding: 15px; margin: 10px 0; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Order Confirmation</h1>
                    </div>
                    <div class='content'>
                        <p>Dear {order.FirstName} {order.LastName},</p>
                        <p>Thank you for your order! We're processing it now.</p>
                        
                        <div class='order-details'>
                            <h3>Order Details</h3>
                            <p><strong>Order ID:</strong> #{order.Id}</p>
                            <p><strong>Order Date:</strong> {order.CreatedDate:yyyy-MM-dd HH:mm}</p>
                            <p><strong>Total Amount:</strong> ${order.TotalPrice:N2}</p>
                            <p><strong>Status:</strong> {order.Status}</p>
                        </div>
                        
                        <div class='order-details'>
                            <h3>Shipping Address</h3>
                            <p>{order.ShipppingAdress}</p>
                        </div>
                        
                        <p>If you have any questions, please contact our support team.</p>
                        <p>Best regards,<br/>Order Service Team</p>
                    </div>
                </div>
            </body>
            </html>";
        }
    }
}

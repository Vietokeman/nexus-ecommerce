using MediatR;
using Microsoft.Extensions.Logging;
using Ordering.Domain.Events;
using Ordering.Domain.Enums;

namespace Ordering.Application.Features.V1.Orders.EventHandlers
{
    /// <summary>
    /// Domain event handler that runs when an order's status changes.
    /// Can be used to send status update notifications.
    /// </summary>
    public class OrderStatusChangedEventHandler : INotificationHandler<OrderStatusChangedEvent>
    {
        private readonly ILogger<OrderStatusChangedEventHandler> _logger;

        public OrderStatusChangedEventHandler(ILogger<OrderStatusChangedEventHandler> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public Task Handle(OrderStatusChangedEvent notification, CancellationToken cancellationToken)
        {
            _logger.LogInformation(
                "Domain Event: {DomainEvent} - OrderId: {OrderId} status changed from {OldStatus} to {NewStatus}",
                notification.GetType().Name,
                notification.Order.Id,
                notification.OldStatus,
                notification.NewStatus);

            // Additional logic based on status change
            switch (notification.NewStatus)
            {
                case EOrderStatus.Paid:
                    _logger.LogInformation("Order {OrderId} has been paid. Proceeding to fulfillment.", notification.Order.Id);
                    break;
                    
                case EOrderStatus.Shipped:
                    _logger.LogInformation("Order {OrderId} has been shipped.", notification.Order.Id);
                    // Could send shipping notification email here
                    break;
                    
                case EOrderStatus.Cancelled:
                    _logger.LogInformation("Order {OrderId} has been cancelled.", notification.Order.Id);
                    // Could send cancellation email here
                    break;
            }

            return Task.CompletedTask;
        }
    }
}

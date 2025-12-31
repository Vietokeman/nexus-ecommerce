using Ordering.Domain.Common;
using Ordering.Domain.Entities;
using Ordering.Domain.Enums;

namespace Ordering.Domain.Events
{
    /// <summary>
    /// Domain event raised when the status of an order changes.
    /// This event can be used to trigger notifications or other side effects.
    /// </summary>
    public class OrderStatusChangedEvent : BaseDomainEvent
    {
        public Order Order { get; }
        public EOrderStatus OldStatus { get; }
        public EOrderStatus NewStatus { get; }

        public OrderStatusChangedEvent(Order order, EOrderStatus oldStatus, EOrderStatus newStatus)
        {
            Order = order;
            OldStatus = oldStatus;
            NewStatus = newStatus;
        }
    }
}

using Ordering.Domain.Common;
using Ordering.Domain.Entities;

namespace Ordering.Domain.Events
{
    /// <summary>
    /// Domain event raised when an order is deleted/cancelled.
    /// This event can be used to trigger cleanup operations or notifications.
    /// </summary>
    public class OrderDeletedEvent : BaseDomainEvent
    {
        public Order Order { get; }

        public OrderDeletedEvent(Order order)
        {
            Order = order;
        }
    }
}

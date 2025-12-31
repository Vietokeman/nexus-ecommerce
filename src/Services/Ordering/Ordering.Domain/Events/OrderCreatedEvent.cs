using Ordering.Domain.Common;
using Ordering.Domain.Entities;

namespace Ordering.Domain.Events
{
    /// <summary>
    /// Domain event raised when a new order is created.
    /// This event can be used to trigger side effects like sending confirmation emails.
    /// </summary>
    public class OrderCreatedEvent : BaseDomainEvent
    {
        public Order Order { get; }

        public OrderCreatedEvent(Order order)
        {
            Order = order;
        }
    }
}

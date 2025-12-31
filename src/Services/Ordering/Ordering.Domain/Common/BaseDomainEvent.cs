using MediatR;

namespace Ordering.Domain.Common
{
    /// <summary>
    /// Base class for domain events in the system.
    /// Domain events are used to capture side effects of domain operations.
    /// </summary>
    public abstract class BaseDomainEvent : INotification
    {
        /// <summary>
        /// Unique identifier for this event instance
        /// </summary>
        public Guid Id { get; } = Guid.NewGuid();
        
        /// <summary>
        /// When the event occurred
        /// </summary>
        public DateTimeOffset DateOccurred { get; protected set; } = DateTimeOffset.UtcNow;
    }
}

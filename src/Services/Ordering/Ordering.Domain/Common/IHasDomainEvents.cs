namespace Ordering.Domain.Common
{
    /// <summary>
    /// Interface for entities that can raise domain events.
    /// Implements the Domain-Driven Design pattern for event sourcing.
    /// </summary>
    public interface IHasDomainEvents
    {
        /// <summary>
        /// Collection of domain events raised by this entity
        /// </summary>
        IReadOnlyCollection<BaseDomainEvent> DomainEvents { get; }
        
        /// <summary>
        /// Add a domain event to this entity
        /// </summary>
        void AddDomainEvent(BaseDomainEvent domainEvent);
        
        /// <summary>
        /// Remove a domain event from this entity
        /// </summary>
        void RemoveDomainEvent(BaseDomainEvent domainEvent);
        
        /// <summary>
        /// Clear all domain events
        /// </summary>
        void ClearDomainEvents();
    }
}

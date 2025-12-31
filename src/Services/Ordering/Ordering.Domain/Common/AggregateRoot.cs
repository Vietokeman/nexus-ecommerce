using Contracts.Domains;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ordering.Domain.Common
{
    /// <summary>
    /// Base class for Aggregate Root entities in DDD.
    /// An Aggregate Root is the main entry point to an aggregate and is responsible for
    /// maintaining the invariants of the aggregate and raising domain events.
    /// </summary>
    public abstract class AggregateRoot<TKey> : EntityAuditBase<TKey>, IHasDomainEvents
    {
        private readonly List<BaseDomainEvent> _domainEvents = new();

        /// <summary>
        /// Domain events raised by this aggregate root.
        /// These events are dispatched after the entity is persisted.
        /// </summary>
        [NotMapped]
        public IReadOnlyCollection<BaseDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

        /// <summary>
        /// Add a domain event to be dispatched after persistence
        /// </summary>
        public void AddDomainEvent(BaseDomainEvent domainEvent)
        {
            _domainEvents.Add(domainEvent);
        }

        /// <summary>
        /// Remove a specific domain event
        /// </summary>
        public void RemoveDomainEvent(BaseDomainEvent domainEvent)
        {
            _domainEvents.Remove(domainEvent);
        }

        /// <summary>
        /// Clear all domain events (typically called after dispatching)
        /// </summary>
        public void ClearDomainEvents()
        {
            _domainEvents.Clear();
        }
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using Ordering.Domain.Common;

namespace Ordering.Infrastructure.Extensions
{
    /// <summary>
    /// Extension methods for dispatching domain events after SaveChanges.
    /// This is a key part of the Event Sourcing pattern with DDD.
    /// </summary>
    public static class MediatorExtensions
    {
        /// <summary>
        /// Dispatches all domain events from entities that have been saved.
        /// Should be called after SaveChangesAsync.
        /// </summary>
        public static async Task DispatchDomainEventsAsync(this IMediator mediator, DbContext context)
        {
            // Get all entities that have domain events
            var entitiesWithEvents = context.ChangeTracker
                .Entries<IHasDomainEvents>()
                .Where(e => e.Entity.DomainEvents.Any())
                .Select(e => e.Entity)
                .ToList();

            // Collect all domain events
            var domainEvents = entitiesWithEvents
                .SelectMany(e => e.DomainEvents)
                .ToList();

            // Clear domain events from entities to prevent re-dispatching
            entitiesWithEvents.ForEach(e => e.ClearDomainEvents());

            // Dispatch each event
            foreach (var domainEvent in domainEvents)
            {
                await mediator.Publish(domainEvent);
            }
        }
    }
}

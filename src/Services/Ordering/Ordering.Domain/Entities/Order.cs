using Contracts.Domains;
using Ordering.Domain.Common;
using Ordering.Domain.Enums;
using Ordering.Domain.Events;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ordering.Domain.Entities
{
    /// <summary>
    /// Order aggregate root entity.
    /// Implements DDD patterns with domain events for event sourcing.
    /// </summary>
    public class Order : AggregateRoot<long>
    {
        [Required]
        public string UserName { get; set; }
        [Column(TypeName = "decimal(10,2")]
        public decimal TotalPrice { get; set; }
        [Required]
        [Column(TypeName = "nvarchar(50)")]
        public string FirstName { get; set; }
        [Required]
        [Column(TypeName = "nvarchar(250)")]
        public string LastName { get; set; }
        [Required]
        [EmailAddress]
        public string EmailAdress { get; set; }
        [Column(TypeName = "nvarchar(max)")]

        public string ShipppingAdress { get; set; }
        [Column(TypeName = "nvarchar(max)")]

        public string InvoiceAdress { get; set; }

        private EOrderStatus _status;
        public EOrderStatus Status
        {
            get => _status;
            set
            {
                if (_status != value)
                {
                    var oldStatus = _status;
                    _status = value;
                    // Raise domain event when status changes
                    AddDomainEvent(new OrderStatusChangedEvent(this, oldStatus, value));
                }
            }
        }
        
        /// <summary>
        /// Factory method to create a new order with domain event
        /// </summary>
        public static Order Create(
            string userName,
            decimal totalPrice,
            string firstName,
            string lastName,
            string emailAddress,
            string shippingAddress,
            string invoiceAddress)
        {
            var order = new Order
            {
                UserName = userName,
                TotalPrice = totalPrice,
                FirstName = firstName,
                LastName = lastName,
                EmailAdress = emailAddress,
                ShipppingAdress = shippingAddress,
                InvoiceAdress = invoiceAddress,
                _status = EOrderStatus.New,
                CreatedDate = DateTimeOffset.UtcNow
            };
            
            // Raise OrderCreatedEvent
            order.AddDomainEvent(new OrderCreatedEvent(order));
            
            return order;
        }
        
        /// <summary>
        /// Mark order for deletion and raise domain event
        /// </summary>
        public void Delete()
        {
            AddDomainEvent(new OrderDeletedEvent(this));
        }
    }
}

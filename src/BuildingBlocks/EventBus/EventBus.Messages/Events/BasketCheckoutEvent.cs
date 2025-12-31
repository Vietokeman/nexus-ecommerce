using System;

namespace EventBus.Messages.Events
{
    /// <summary>
    /// Integration event that is published when a customer checks out their basket.
    /// This event is consumed by the Ordering service to create an order.
    /// </summary>
    public class BasketCheckoutEvent : IntegrationBaseEvent
    {
        // User information
        public string UserName { get; set; } = string.Empty;
        
        // Total price of the basket
        public decimal TotalPrice { get; set; }
        
        // Billing address
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string EmailAddress { get; set; } = string.Empty;
        
        // Shipping address
        public string ShippingAddress { get; set; } = string.Empty;
        
        // Invoice address
        public string InvoiceAddress { get; set; } = string.Empty;
    }
}

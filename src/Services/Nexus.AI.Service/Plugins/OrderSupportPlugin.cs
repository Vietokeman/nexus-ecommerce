using System.ComponentModel;
using Microsoft.SemanticKernel;

namespace Nexus.AI.Service.Plugins;

public sealed class OrderSupportPlugin
{
    [KernelFunction("get_order_support_policy")]
    [Description("Returns the current order support policy summary used by Nexus AI for customer support guidance.")]
    public string GetOrderSupportPolicy()
        => "For order support, explain that order-specific state is not directly available in Nexus.AI.Service. Direct the customer to the order service or support staff with their order number. You may still provide general guidance for cancellation, refund, and delivery issue triage, but clearly label it as general guidance.";
}

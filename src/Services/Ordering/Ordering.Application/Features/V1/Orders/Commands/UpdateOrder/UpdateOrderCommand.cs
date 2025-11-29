using MediatR;
using Ordering.Application.Common.Mappings;
using Ordering.Domain.Enums;

namespace Ordering.Application.Features.V1.Orders.Commands.UpdateOrder
{
    public class UpdateOrderCommand : IRequest, IMapFrom<Domain.Entities.Order>
    {
        public long Id { get; set; }
        public string UserName { get; set; }
        public decimal TotalPrice { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAdress { get; set; }
        public string ShipppingAdress { get; set; }
        public string InvoiceAdress { get; set; }
        public EOrderStatus Status { get; set; }
    }
}

using MediatR;
using Ordering.Application.Common.Mappings;
using Ordering.Application.Common.Models;
using Ordering.Domain.Enums;

namespace Ordering.Application.Features.V1.Orders.Commands.CreateOrder
{
    public class CreateOrderCommand : IRequest<long>, IMapFrom<Domain.Entities.Order>
    {
        public string UserName { get; set; }
        public decimal TotalPrice { get; set; } = 0;
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAdress { get; set; }
        public string ShipppingAdress { get; set; }
        public string InvoiceAdress { get; set; }
        public EOrderStatus Status { get; set; } = EOrderStatus.New;
    }
}

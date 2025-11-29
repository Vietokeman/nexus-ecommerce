using MediatR;
using Ordering.Application.Common.Models;
using Shared.SeedWork;

namespace Ordering.Application.Features.V1.Orders.Queries.GetOrdersWithPagination
{
    public class GetOrdersWithPaginationQuery : PagingRequestParameters, IRequest<PagedList<OrderDto>>
    {
    }
}

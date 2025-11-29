using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Ordering.Application.Common.Interfaces;
using Ordering.Application.Common.Models;
using Shared.SeedWork;

namespace Ordering.Application.Features.V1.Orders.Queries.GetOrdersWithPagination
{
    public class GetOrdersWithPaginationQueryHandler : IRequestHandler<GetOrdersWithPaginationQuery, PagedList<OrderDto>>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IMapper _mapper;

        public GetOrdersWithPaginationQueryHandler(IOrderRepository orderRepository, IMapper mapper)
        {
            _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<PagedList<OrderDto>> Handle(GetOrdersWithPaginationQuery request, CancellationToken cancellationToken)
        {
            var query = _orderRepository.FindAll();

            // Apply search term if provided
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                query = query.Where(x => x.UserName.Contains(request.SearchTerm) 
                    || x.FirstName.Contains(request.SearchTerm)
                    || x.LastName.Contains(request.SearchTerm)
                    || x.EmailAdress.Contains(request.SearchTerm));
            }

            // Apply ordering - default by CreatedDate descending
            query = query.OrderByDescending(x => x.CreatedDate);

            var totalCount = await query.CountAsync(cancellationToken);
            var orders = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var orderDtos = _mapper.Map<List<OrderDto>>(orders);

            return new PagedList<OrderDto>(orderDtos, totalCount, request.PageNumber, request.PageSize);
        }
    }
}

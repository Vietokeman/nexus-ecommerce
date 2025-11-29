using AutoMapper;
using MediatR;
using Ordering.Application.Common.Interfaces;
using Ordering.Domain.Entities;

namespace Ordering.Application.Features.V1.Orders.Commands.CreateOrder
{
    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, long>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IMapper _mapper;

        public CreateOrderCommandHandler(IOrderRepository orderRepository, IMapper mapper)
        {
            _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<long> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            var orderEntity = _mapper.Map<Order>(request);
            var newOrder = await _orderRepository.CreateAsync(orderEntity);
            await _orderRepository.SaveChangesAsync();

            return newOrder;
        }
    }
}

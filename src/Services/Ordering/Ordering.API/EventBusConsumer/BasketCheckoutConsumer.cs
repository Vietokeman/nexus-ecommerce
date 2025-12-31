using AutoMapper;
using EventBus.Messages.Events;
using MassTransit;
using MediatR;
using Ordering.Application.Features.V1.Orders.Commands.CreateOrder;

namespace Ordering.API.EventBusConsumer
{
    /// <summary>
    /// Consumer that handles BasketCheckoutEvent published by Basket.API
    /// Creates a new order when a customer checks out their basket
    /// </summary>
    public class BasketCheckoutConsumer : IConsumer<BasketCheckoutEvent>
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;
        private readonly ILogger<BasketCheckoutConsumer> _logger;

        public BasketCheckoutConsumer(
            IMediator mediator,
            IMapper mapper,
            ILogger<BasketCheckoutConsumer> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task Consume(ConsumeContext<BasketCheckoutEvent> context)
        {
            _logger.LogInformation("BasketCheckoutEvent consumed. Creating order for user: {UserName}", 
                context.Message.UserName);

            // Map the event to CreateOrderCommand
            var command = _mapper.Map<CreateOrderCommand>(context.Message);

            // Send command through MediatR to create the order
            var result = await _mediator.Send(command);

            _logger.LogInformation("Order created successfully. OrderId: {OrderId}, UserName: {UserName}", 
                result, context.Message.UserName);
        }
    }
}

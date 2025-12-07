using AutoMapper;
using Contracts.Messages;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Ordering.Application.Common.Interfaces;
using Ordering.Application.Common.Models;
using Ordering.Application.Features.V1.Orders.Commands.CreateOrder;
using Ordering.Application.Features.V1.Orders.Commands.DeleteOrder;
using Ordering.Application.Features.V1.Orders.Commands.UpdateOrder;
using Ordering.Application.Features.V1.Orders.Queries.GetOrders;
using Ordering.Application.Features.V1.Orders.Queries.GetOrdersWithPagination;
using Ordering.Domain.Entities;
using RabbitMQ.Client;
using Shared.SeedWork;
using System.ComponentModel.DataAnnotations;
using System.Net;

namespace Ordering.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ILogger<OrdersController> _logger;
        private readonly IMediator _mediator;
        private readonly IMessageProducer _messageProducer;
        private readonly IOrderRepository _orderRepository;
        private readonly IMapper _mapper;
        public OrdersController(ILogger<OrdersController> logger, IMediator mediator, IMessageProducer messageProducer, IOrderRepository orderRepository, IMapper mapper)
        {
            _logger = logger;
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _messageProducer = messageProducer ?? throw new ArgumentNullException(nameof(messageProducer));
            _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(_orderRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        private static class RouteNames
        {
            public const string GetOrdersByUserName = nameof(GetOrdersByUserName);
            public const string GetOrders = nameof(GetOrders);
            public const string CreateOrder = nameof(CreateOrder);
            public const string UpdateOrder = nameof(UpdateOrder);
            public const string DeleteOrder = nameof(DeleteOrder);
        }

        [HttpGet(Name = RouteNames.GetOrders)]
        [ProducesResponseType(typeof(PagedList<OrderDto>), (int)HttpStatusCode.OK)]
        public async Task<ActionResult<PagedList<OrderDto>>> GetOrders([FromQuery] GetOrdersWithPaginationQuery query)
        {
            var results = await _mediator.Send(query);
            return Ok(results);
        }

        [HttpGet("{userName}", Name = RouteNames.GetOrdersByUserName)]
        [ProducesResponseType(typeof(IEnumerable<OrderDto>), (int)HttpStatusCode.OK)]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrdersByUserName([Required] string userName)
        {
            var query = new GetOrdersQuery(userName);
            var results = await _mediator.Send(query);
            return Ok(results);
        }

        [HttpPost(Name = RouteNames.CreateOrder)]
        [ProducesResponseType(typeof(long), (int)HttpStatusCode.Created)]
        public async Task<ActionResult<long>> CreateOrder([FromBody] CreateOrderCommand command)
        {
            var result = await _mediator.Send(command);
            return CreatedAtRoute(RouteNames.GetOrdersByUserName, new { userName = command.UserName }, result);
        }

        [HttpPut("{id}", Name = RouteNames.UpdateOrder)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.NoContent)]
        public async Task<ActionResult> UpdateOrder([Required] long id, [FromBody] UpdateOrderCommand command)
        {
            command.Id = id;
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("{id}", Name = RouteNames.DeleteOrder)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.NoContent)]
        public async Task<ActionResult> DeleteOrder([Required] long id)
        {
            var command = new DeleteOrderCommand(id);
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpPost("publish", Name = "PublishTestMessage")]
        [ProducesResponseType(typeof(OrderDto), (int)HttpStatusCode.Accepted)]
        public async Task<ActionResult> CreateOrder([FromBody] OrderDto orderDto)
        {
            var order = _mapper.Map<Order>(orderDto);
            await _orderRepository.CreateAsync(order);
            await _orderRepository.SaveChangesAsync();
            // After SaveChangesAsync, order.Id is populated by EF
            _messageProducer.SendMessage(order);
            var result = _mapper.Map<OrderDto>(order);
            return Ok(result);
        }

        [HttpGet("test-transmit", Name = "TestTransmit")]
        [ProducesResponseType(typeof(string), (int)HttpStatusCode.OK)]
        public async Task<ActionResult<string>> TestTransmit()
        {
            var connectionFactory = new ConnectionFactory()
            {
                HostName = "localhost",
            };
            var connection = await connectionFactory.CreateConnectionAsync();
            using var channel = await connection.CreateChannelAsync();
            await channel.QueueDeclareAsync(
                queue: "order",
                exclusive: false
            );

            // Publish a test message
            var message = "Test message from API";
            var body = System.Text.Encoding.UTF8.GetBytes(message);
            await channel.BasicPublishAsync(exchange: string.Empty, routingKey: "order", body: body);

            // Try to consume the message
            var result = await channel.BasicGetAsync(queue: "order", autoAck: true);
            if (result != null)
            {
                var receivedMessage = System.Text.Encoding.UTF8.GetString(result.Body.ToArray());
                return Ok($"Published and received: {receivedMessage}");
            }
            else
            {
                return Ok("Published test message, but no message received (queue might be empty)");
            }
        }
    }
}


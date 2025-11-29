using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Ordering.Application.Common.Models;
using Ordering.Application.Features.V1.Orders.Commands.CreateOrder;
using Ordering.Application.Features.V1.Orders.Commands.DeleteOrder;
using Ordering.Application.Features.V1.Orders.Commands.UpdateOrder;
using Ordering.Application.Features.V1.Orders.Queries.GetOrders;
using Ordering.Application.Features.V1.Orders.Queries.GetOrdersWithPagination;
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
        public OrdersController(ILogger<OrdersController> logger, IMediator mediator)
        {
            _logger = logger;
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
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
    }
}


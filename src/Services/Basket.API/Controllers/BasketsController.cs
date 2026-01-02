using AutoMapper;
using Basket.API.Entities;
using Basket.API.GrpcServices;
using Basket.API.Repositories.Interfaces;
using EventBus.Messages.Events;
using MassTransit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using System.ComponentModel.DataAnnotations;
using System.Net;

namespace Basket.API.Controllers
{
    [Route("api/baskets")]
    [ApiController]
    public class BasketsController : ControllerBase
    {
        private readonly IBasketRepository _basketRepository;
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly StockGrpcClient _stockGrpcClient;
        private readonly ILogger<BasketsController> _logger;

        public BasketsController(
            IBasketRepository basketRepository,
            IPublishEndpoint publishEndpoint,
            StockGrpcClient stockGrpcClient,
            ILogger<BasketsController> logger)
        {
            _basketRepository = basketRepository;
            _publishEndpoint = publishEndpoint;
            _stockGrpcClient = stockGrpcClient;
            _logger = logger;
        }

        [HttpGet(template: "{username}", Name = "GetBasket")]
        [ProducesResponseType(typeof(Cart), (int)HttpStatusCode.OK)]
        public async Task<ActionResult<Cart>> GetBasketByUsername([Required, MinLength(1)] string username)
        {
            var result = await _basketRepository.GetBasketByUsernameAsync(username);
            return Ok(result ?? new Cart());
        }

        [HttpPost(Name = "UpdateBasket")]
        [ProducesResponseType(typeof(Cart), (int)HttpStatusCode.OK)]
        public async Task<ActionResult<Cart>> UpdateBasket([FromBody] Cart cart)
        {
            var options = new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(DateTime.UtcNow.AddHours(1))
                .SetSlidingExpiration(TimeSpan.FromMinutes(5));
            var result = await _basketRepository.UpdateBasketAsync(cart, options);
            return Ok(result);
        }

        [HttpDelete(template: "{username}", Name = "DeleteBasket")]
        [ProducesResponseType(typeof(bool), (int)HttpStatusCode.OK)]
        public async Task<ActionResult<bool>> DeleteBasket([Required, MinLength(1)] string username)
        {
            var result = await _basketRepository.DeleteBasketFromUsernameAsync(username);
            return Ok(result);
        }

        /// <summary>
        /// Checkout basket and publish BasketCheckoutEvent to RabbitMQ
        /// The Ordering service will consume this event to create an order
        /// Validates stock availability via gRPC call to Inventory service
        /// </summary>
        [HttpPost("checkout", Name = "CheckoutBasket")]
        [ProducesResponseType((int)HttpStatusCode.Accepted)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<ActionResult> CheckoutBasket([FromBody] BasketCheckout basketCheckout)
        {
            // Get existing basket with total price
            var basket = await _basketRepository.GetBasketByUsernameAsync(basketCheckout.UserName);
            if (basket == null)
            {
                _logger.LogWarning("Basket not found for user: {UserName}", basketCheckout.UserName);
                return BadRequest($"Basket not found for user: {basketCheckout.UserName}");
            }

            // ⭐ VALIDATE STOCK VIA gRPC CALL TO INVENTORY SERVICE ⭐
            try
            {
                var itemQuantities = basket.Items.ToDictionary(x => x.ProductId, x => x.Quantity);
                var stockValidation = await _stockGrpcClient.ValidateCartStockAsync(itemQuantities);
                
                var outOfStockItems = stockValidation.Where(x => !x.Value).Select(x => x.Key).ToList();
                if (outOfStockItems.Any())
                {
                    _logger.LogWarning("Items out of stock: {Items}", string.Join(", ", outOfStockItems));
                    return BadRequest(new
                    {
                        error = "Some items are out of stock",
                        outOfStockItems = outOfStockItems
                    });
                }
                
                _logger.LogInformation("Stock validation passed for all items in basket");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating stock via gRPC");
                return BadRequest("Unable to validate stock availability. Please try again later.");
            }

            // Create integration event to be published through the event bus
            var eventMessage = new BasketCheckoutEvent
            {
                UserName = basketCheckout.UserName,
                TotalPrice = basketCheckout.TotalPrice > 0 ? basketCheckout.TotalPrice : basket.TotalPrice,
                FirstName = basketCheckout.FirstName,
                LastName = basketCheckout.LastName,
                EmailAddress = basketCheckout.EmailAddress,
                ShippingAddress = basketCheckout.ShippingAddress,
                InvoiceAddress = basketCheckout.InvoiceAddress
            };

            // Publish the event using MassTransit
            await _publishEndpoint.Publish(eventMessage);
            _logger.LogInformation("BasketCheckoutEvent published for user: {UserName}", basketCheckout.UserName);

            // Remove the basket after checkout
            await _basketRepository.DeleteBasketFromUsernameAsync(basketCheckout.UserName);
            _logger.LogInformation("Basket removed after checkout for user: {UserName}", basketCheckout.UserName);

            return Accepted();
        }
        
        /// <summary>
        /// Check stock availability for an item via gRPC
        /// Demonstrates gRPC communication between microservices
        /// </summary>
        [HttpGet("stock/{itemNo}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        public async Task<ActionResult> CheckStock(string itemNo)
        {
            try
            {
                var stock = await _stockGrpcClient.GetStockAsync(itemNo);
                return Ok(new
                {
                    itemNo = stock.ItemNo,
                    quantity = stock.Quantity,
                    isAvailable = stock.IsAvailable
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking stock for item: {ItemNo}", itemNo);
                return BadRequest("Unable to check stock");
            }
        }
        }
    }
}

using Basket.API.Entities;
using Basket.API.Repositories.Interfaces;
using Contracts.Common.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using ILogger = Serilog.ILogger;
namespace Basket.API.Repositories
{
    public class BasketRepository : IBasketRepository
    {
        private readonly IDistributedCache _redisCacheService;
        private readonly ISerializeService _serializeService;
        private readonly ILogger _logger;
        public BasketRepository(IDistributedCache redisCacheService, ISerializeService serializeService, ILogger logger)
        {
            _redisCacheService = redisCacheService;
            _serializeService = serializeService;
            _logger = logger;
        }
        public async Task<bool> DeleteBasketFromUsernameAsync(string username)
        {
            try
            {
                _logger.Information("BEGIN : DELETE BASKET FROM USERNAME");
                await _redisCacheService.RemoveAsync(username);
                _logger.Information("END : DELETE BASKET FROM USERNAME");

                return true;
            }
            catch (Exception e)
            {
                _logger.Error("DeleteBasket from username : " + e.Message);
                throw;
            }
        }

        public async Task<Cart?> GetBasketByUsernameAsync(string username)
        {
            _logger.Information($"BEGIN : GET BASKET BY {username}");

            var basket = await _redisCacheService.GetStringAsync(username);

            _logger.Information($"END : GET BASKET BY {username}");

            return string.IsNullOrEmpty(basket) ? null : _serializeService.Deserialize<Cart>(basket);
        }

        public async Task<Cart> UpdateBasketAsync(Cart cart, DistributedCacheEntryOptions options = null)
        {
            _logger.Information($"BEGIN : update BASKET  {cart.Username}");

            if (options != null)

            {
                await _redisCacheService.SetStringAsync(cart.Username, _serializeService.Serialize(cart), options);
            }
            else
            {
                await _redisCacheService.SetStringAsync(cart.Username, _serializeService.Serialize(cart));
            }
            _logger.Information($"END : update BASKET for  {cart.Username}");

            return await GetBasketByUsernameAsync(cart.Username);
        }
    }
}

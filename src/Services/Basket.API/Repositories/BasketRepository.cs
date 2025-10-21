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
                await _redisCacheService.RemoveAsync(username);
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
            var basket = await _redisCacheService.GetStringAsync(username);
            return string.IsNullOrEmpty(basket) ? null : _serializeService.Deserialize<Cart>(basket);
        }

        public async Task<Cart> UpdateBasketAsync(Cart cart, DistributedCacheEntryOptions options = null)
        {
            if (options != null)

            {
                await _redisCacheService.SetStringAsync(cart.Username, _serializeService.Serialize(cart), options);
            }
            else
            {
                await _redisCacheService.SetStringAsync(cart.Username, _serializeService.Serialize(cart));
            }

            return await GetBasketByUsernameAsync(cart.Username);
        }
    }
}

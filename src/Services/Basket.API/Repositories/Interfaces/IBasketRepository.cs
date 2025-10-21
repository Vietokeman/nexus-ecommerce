using Basket.API.Entities;
using Microsoft.Extensions.Caching.Distributed;

namespace Basket.API.Repositories.Interfaces
{
    public interface IBasketRepository
    {
        Task<Cart?> GetBasketByUsernameAsync(string username);
        Task<Entities.Cart> UpdateBasketAsync(Entities.Cart cart, DistributedCacheEntryOptions options = null);
        Task<bool> DeleteBasketFromUsernameAsync(string username);
    }
}

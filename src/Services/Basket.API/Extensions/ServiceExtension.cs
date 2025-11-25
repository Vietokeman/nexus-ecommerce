using Basket.API.Repositories;
using Basket.API.Repositories.Interfaces;
using Contracts.Common.Interfaces;
using Infrastructure.Common;

namespace Basket.API.Extensions
{
    public static class ServiceExtension
    {
        public static IServiceCollection ConfigureServices(this IServiceCollection services) => services.AddScoped<IBasketRepository, BasketRepository>()
            .AddTransient<ISerializeService, SeriallizeService>();
        public static void ConfigureRedis(this IServiceCollection services, IConfiguration configuration)
        {
            var redisConnectionString = configuration.GetSection("CacheSettings:ConnectionString").Value;

            if (string.IsNullOrEmpty(redisConnectionString))
                throw new ArgumentNullException("Redis connection string is not configured.");

            services.AddStackExchangeRedisCache(options =>
            {
                options.ConfigurationOptions = StackExchange.Redis.ConfigurationOptions.Parse(redisConnectionString);
            });
        }
    };

    
}

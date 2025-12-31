using Basket.API.Repositories;
using Basket.API.Repositories.Interfaces;
using Contracts.Common.Interfaces;
using Infrastructure.Common;
using MassTransit;

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
        
        /// <summary>
        /// Configure MassTransit with RabbitMQ for publishing events
        /// </summary>
        public static void ConfigureMassTransit(this IServiceCollection services, IConfiguration configuration)
        {
            var settings = configuration.GetSection("EventBusSettings");
            var hostAddress = settings.GetValue<string>("HostAddress") ?? "amqp://guest:guest@localhost:5672";

            services.AddMassTransit(config =>
            {
                config.UsingRabbitMq((context, cfg) =>
                {
                    cfg.Host(new Uri(hostAddress));
                    
                    // Configure endpoints automatically
                    cfg.ConfigureEndpoints(context);
                });
            });
        }
    };

    
}


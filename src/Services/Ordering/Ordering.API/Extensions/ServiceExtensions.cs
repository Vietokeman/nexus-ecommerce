using MassTransit;
using Ordering.API.EventBusConsumer;

namespace Ordering.API.Extensions
{
    /// <summary>
    /// Extension methods for configuring MassTransit with RabbitMQ for consuming events
    /// </summary>
    public static class ServiceExtensions
    {
        /// <summary>
        /// Configure MassTransit with RabbitMQ for consuming events
        /// </summary>
        public static IServiceCollection ConfigureMassTransit(this IServiceCollection services, IConfiguration configuration)
        {
            var settings = configuration.GetSection("EventBusSettings");
            var hostAddress = settings.GetValue<string>("HostAddress") ?? "amqp://guest:guest@localhost:5672";

            services.AddMassTransit(config =>
            {
                // Register the consumer
                config.AddConsumer<BasketCheckoutConsumer>();

                config.UsingRabbitMq((context, cfg) =>
                {
                    cfg.Host(new Uri(hostAddress));

                    // Configure the consumer endpoint
                    cfg.ReceiveEndpoint("basket-checkout-queue", e =>
                    {
                        e.ConfigureConsumer<BasketCheckoutConsumer>(context);
                    });
                    
                    // Configure endpoints automatically for other consumers
                    cfg.ConfigureEndpoints(context);
                });
            });

            return services;
        }
    }
}

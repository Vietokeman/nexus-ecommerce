namespace Product.API.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            // Add controllers
            services.AddControllers();


            //config route
            services.Configure<RouteOptions>(options =>
            {
                options.LowercaseUrls = true; // Convert URLs to lowercase
                options.LowercaseQueryStrings = true; // Convert query strings to lowercase
            });
            // Add Swagger for API documentation

            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            // Add other necessary services here, e.g., database context, repositories, etc.

            return services;
        }
    }
}

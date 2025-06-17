using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Product.API.Persistence;

namespace Product.API.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
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

            services.ConfigureProductionDbContext(configuration);

            return services;
        }


        private static IServiceCollection ConfigureProductionDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnectionString");
            var builder = new MySqlConnectionStringBuilder(connectionString);

            services.AddDbContext<ProductContext>(options => options.UseMySql(builder.ConnectionString, ServerVersion.AutoDetect(builder.ConnectionString), e =>
            {
                e.MigrationsAssembly("Product.API");
                e.SchemaBehavior(Pomelo.EntityFrameworkCore.MySql.Infrastructure.MySqlSchemaBehavior.Ignore);
            }));


            return services;
        }
    }
}

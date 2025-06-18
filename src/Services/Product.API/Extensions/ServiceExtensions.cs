using Contracts.Common.Interfaces;
using Infrastructure.Common;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Product.API.Persistence;
using Product.API.Repositories;
using Product.API.Repositories.Interfaces;

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
            services.AddInfrastructureServices();
            services.AddAutoMapper(config => config.AddProfile(new MappingProfile()));
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


        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
        {
            //service dependencies injection
            return services.AddScoped(typeof(IRepositoryBaseAsync<,,>), typeof(RepositoryBaseAsync<,,>))
                .AddScoped(typeof(IUnitOfWork<>), typeof(UnitOfWork<>))
                .AddScoped<IProducRepository, ProductRepository>();
        }
    }
}

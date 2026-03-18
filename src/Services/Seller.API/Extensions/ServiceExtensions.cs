using Contracts.Common.Interfaces;
using Infrastructure.Common;
using Microsoft.EntityFrameworkCore;
using Seller.API.Persistence;
using Seller.API.Repositories;
using Seller.API.Repositories.Interfaces;
using Seller.API.Services;

namespace Seller.API.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Add controllers
            services.AddControllers();

            // Config route
            services.Configure<RouteOptions>(options =>
            {
                options.LowercaseUrls = true;
                options.LowercaseQueryStrings = true;
            });

            // Add Swagger
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            // Database
            services.ConfigureSellerDbContext(configuration);
            services.AddInfrastructureServices();
            services.AddAutoMapper(config => config.AddProfile(new MappingProfile()));

            // AI Content Service
            services.AddHttpClient<IAIContentService, AIContentService>();

            // Health Checks
            services.AddHealthChecks()
                .AddNpgSql(
                    configuration.GetConnectionString("DefaultConnectionString")!,
                    name: "postgresql",
                    tags: new[] { "db", "postgresql" });

            return services;
        }

        private static IServiceCollection ConfigureSellerDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnectionString");

            services.AddDbContext<SellerContext>(options => options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly("Seller.API");
            }));

            return services;
        }

        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
        {
            return services.AddScoped(typeof(IRepositoryBaseAsync<,,>), typeof(RepositoryBaseAsync<,,>))
                .AddScoped(typeof(IUnitOfWork<>), typeof(UnitOfWork<>))
                .AddScoped<ISellerProductRepository, SellerProductRepository>()
                .AddScoped<IProductReviewRepository, ProductReviewRepository>();
        }
    }
}

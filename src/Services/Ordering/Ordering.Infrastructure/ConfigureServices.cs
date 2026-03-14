using Contracts.Common.Interfaces;
using Infrastructure.Common;
using Infrastructure.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ordering.Application.Common.Interfaces;
using Ordering.Infrastructure.Configurations;
using Ordering.Infrastructure.Persistence;
using Ordering.Infrastructure.Repositories;
using Ordering.Infrastructure.Services;

namespace Ordering.Infrastructure;

public static class ConfigureServices
{
    public static IServiceCollection AddInfastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuditLogging(configuration, "ordering-api");

        services.AddDbContext<OrderContext>((sp, options) =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnectionString"),
                npgsqlOptions => npgsqlOptions.MigrationsAssembly(typeof(OrderContext).Assembly.FullName));

            options.AddInterceptors(sp.GetRequiredService<AuditSaveChangesInterceptor>());
        });

        services.AddScoped<OrderContextSeed>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped(typeof(IUnitOfWork<>), typeof(UnitOfWork<>));
        
        // Configure Email Service with Google SMTP
        services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));
        services.AddScoped<IEmailService, EmailService>();
        
        return services;
    }
}

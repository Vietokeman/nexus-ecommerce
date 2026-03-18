using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Nexus.AI.Service.Middleware;

namespace Nexus.AI.Service.Extensions;

public static class ApplicationExtensions
{
    public static WebApplication UseInfrastructure(this WebApplication app)
    {
        app.UseSwagger();

        app.UseMiddleware<ApiKeyProtectionMiddleware>();
        app.UseRouting();
        app.UseAuthorization();

        app.MapControllers();
        app.MapHealthChecks("/health", new HealthCheckOptions());

        return app;
    }
}

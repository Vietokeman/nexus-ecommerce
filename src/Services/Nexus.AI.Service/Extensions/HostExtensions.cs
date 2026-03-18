using Microsoft.EntityFrameworkCore;
using Nexus.AI.Service.Persistence;

namespace Nexus.AI.Service.Extensions;

public static class HostExtensions
{
    public static IHost MigrateDatabase(this IHost host)
    {
        using var scope = host.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<NexusAiDbContext>();
        context.Database.EnsureCreated();
        return host;
    }
}

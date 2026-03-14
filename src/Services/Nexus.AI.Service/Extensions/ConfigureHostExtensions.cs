namespace Nexus.AI.Service.Extensions;

public static class ConfigureHostExtensions
{
    public static void AddAppConfigurations(this IHostBuilder host)
    {
        host.ConfigureAppConfiguration((hostingContext, config) =>
        {
            var env = hostingContext.HostingEnvironment;

            config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                  .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true)
                  .AddEnvironmentVariables();
        });
    }
}

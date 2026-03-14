using Microsoft.Extensions.Options;
using Nexus.AI.Service.Options;

namespace Nexus.AI.Service.Middleware;

public sealed class ApiKeyProtectionMiddleware(
    RequestDelegate next,
    IOptions<AiOptions> options,
    ILogger<ApiKeyProtectionMiddleware> logger)
{
    private readonly AiOptions _options = options.Value;

    public async Task InvokeAsync(HttpContext context)
    {
        if (!RequiresProtection(context.Request.Path))
        {
            await next(context);
            return;
        }

        if (string.IsNullOrWhiteSpace(_options.Security.ApiKey) || _options.Security.ApiKey == "change-me")
        {
            logger.LogWarning("AI admin endpoint protection is enabled but Ai:Security:ApiKey is not configured.");
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            await context.Response.WriteAsJsonAsync(new { message = "AI admin API key is not configured." });
            return;
        }

        if (!context.Request.Headers.TryGetValue(_options.Security.HeaderName, out var provided) ||
            !provided.Any(value => string.Equals(value, _options.Security.ApiKey, StringComparison.Ordinal)))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { message = "Missing or invalid AI admin API key." });
            return;
        }

        await next(context);
    }

    private bool RequiresProtection(PathString path)
        => _options.Security.ProtectedPrefixes.Any(prefix => path.StartsWithSegments(prefix, StringComparison.OrdinalIgnoreCase));
}

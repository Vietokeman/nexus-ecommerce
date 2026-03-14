using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Nexus.AI.Service.Middleware;
using Nexus.AI.Service.Options;
using Xunit;

namespace Nexus.AI.Service.Tests;

public sealed class ApiKeyProtectionMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_AllowsUnprotectedPath_AndCallsNext()
    {
        // Arrange
        var called = false;
        var middleware = CreateMiddleware(
            next: context =>
            {
                called = true;
                context.Response.StatusCode = StatusCodes.Status204NoContent;
                return Task.CompletedTask;
            },
            options: new AiOptions
            {
                Security = new SecurityOptions
                {
                    ApiKey = "secret",
                    ProtectedPrefixes = ["/api/ai/admin"]
                }
            });

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/ai/chat/sessions";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.True(called);
        Assert.Equal(StatusCodes.Status204NoContent, context.Response.StatusCode);
    }

    [Fact]
    public async Task InvokeAsync_RejectsWhenAdminKeyNotConfigured()
    {
        // Arrange
        var middleware = CreateMiddleware(
            next: _ => Task.CompletedTask,
            options: new AiOptions
            {
                Security = new SecurityOptions
                {
                    ApiKey = "change-me",
                    ProtectedPrefixes = ["/api/ai/admin"]
                }
            });

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/ai/admin/sync/products";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, context.Response.StatusCode);
    }

    [Fact]
    public async Task InvokeAsync_RejectsWhenHeaderMissingOrInvalid()
    {
        // Arrange
        var middleware = CreateMiddleware(
            next: _ => Task.CompletedTask,
            options: new AiOptions
            {
                Security = new SecurityOptions
                {
                    HeaderName = "X-Nexus-AI-Key",
                    ApiKey = "secret",
                    ProtectedPrefixes = ["/api/ai/admin"]
                }
            });

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/ai/admin/sync/products";
        context.Request.Headers["X-Nexus-AI-Key"] = "wrong";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.Equal(StatusCodes.Status401Unauthorized, context.Response.StatusCode);
    }

    [Fact]
    public async Task InvokeAsync_AllowsProtectedPath_WhenHeaderIsValid()
    {
        // Arrange
        var called = false;
        var middleware = CreateMiddleware(
            next: context =>
            {
                called = true;
                context.Response.StatusCode = StatusCodes.Status200OK;
                return Task.CompletedTask;
            },
            options: new AiOptions
            {
                Security = new SecurityOptions
                {
                    HeaderName = "X-Nexus-AI-Key",
                    ApiKey = "secret",
                    ProtectedPrefixes = ["/api/ai/admin"]
                }
            });

        var context = new DefaultHttpContext();
        context.Request.Path = "/api/ai/admin/search";
        context.Request.Headers["X-Nexus-AI-Key"] = "secret";

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Assert.True(called);
        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
    }

    private static ApiKeyProtectionMiddleware CreateMiddleware(RequestDelegate next, AiOptions options)
    {
        var logger = LoggerFactory.Create(builder => builder.AddDebug()).CreateLogger<ApiKeyProtectionMiddleware>();
        return new ApiKeyProtectionMiddleware(next, Microsoft.Extensions.Options.Options.Create(options), logger);
    }
}

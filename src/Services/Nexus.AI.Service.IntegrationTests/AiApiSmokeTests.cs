using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Nexus.AI.Service.IntegrationTests;

public sealed class AiApiSmokeTests
{
    private static readonly Uri BaseUri = new(Environment.GetEnvironmentVariable("NEXUS_AI_TEST_BASEURL") ?? "http://localhost:6013");

    [Fact]
    public async Task HealthEndpoint_ReturnsSuccess()
    {
        using var client = new HttpClient { BaseAddress = BaseUri };
        using var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task AdminSync_WithoutApiKey_IsRejected()
    {
        using var client = new HttpClient { BaseAddress = BaseUri };
        using var response = await client.PostAsync("/api/ai/admin/sync/products", content: null);

        Assert.True(response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.ServiceUnavailable);
    }

}

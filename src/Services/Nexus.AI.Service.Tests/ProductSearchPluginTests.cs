using Nexus.AI.Service.Models;
using Nexus.AI.Service.Plugins;
using Nexus.AI.Service.Services;
using Xunit;

namespace Nexus.AI.Service.Tests;

public sealed class ProductSearchPluginTests
{
    [Fact]
    public async Task SearchProductsAsync_ReturnsSerializedResults()
    {
        var plugin = new ProductSearchPlugin(new FakeProductVectorService());

        var json = await plugin.SearchProductsAsync("gaming mouse", 5, CancellationToken.None);

        Assert.Contains("P001", json);
        Assert.Contains("Gaming Mouse", json);
    }

    [Fact]
    public async Task SearchProductsAsync_ClampsTopK_ToMaxTen()
    {
        var fakeService = new FakeProductVectorService();
        var plugin = new ProductSearchPlugin(fakeService);

        await plugin.SearchProductsAsync("keyboard", 999, CancellationToken.None);

        Assert.Equal(10, fakeService.LastTopK);
    }

    private sealed class FakeProductVectorService : IProductVectorService
    {
        public int LastTopK { get; private set; }

        public Task<IReadOnlyCollection<ProductSearchResult>> SearchAsync(string query, int topK, CancellationToken cancellationToken)
        {
            LastTopK = topK;
            IReadOnlyCollection<ProductSearchResult> data =
            [
                new ProductSearchResult(1, "P001", "Gaming Mouse", 25m, "Accessories", "RGB", null, 0.98)
            ];

            return Task.FromResult(data);
        }
    }
}

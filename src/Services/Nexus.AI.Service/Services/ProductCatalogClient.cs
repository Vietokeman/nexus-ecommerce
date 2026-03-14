using System.Net.Http.Json;
using System.Text.Json;
using Nexus.AI.Service.Models;

namespace Nexus.AI.Service.Services;

public sealed class ProductCatalogClient(HttpClient httpClient) : IProductCatalogClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<IReadOnlyCollection<ProductCatalogItem>> GetProductsAsync(CancellationToken cancellationToken)
    {
        var response = await httpClient.GetAsync("/api/products", cancellationToken);
        response.EnsureSuccessStatusCode();

        var products = await response.Content.ReadFromJsonAsync<List<ProductCatalogItem>>(JsonOptions, cancellationToken);
        return products ?? [];
    }
}

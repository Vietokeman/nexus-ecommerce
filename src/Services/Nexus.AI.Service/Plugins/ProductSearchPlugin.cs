using System.ComponentModel;
using System.Text.Json;
using Microsoft.SemanticKernel;
using Nexus.AI.Service.Services;

namespace Nexus.AI.Service.Plugins;

public sealed class ProductSearchPlugin(IProductVectorService productVectorService)
{
    [KernelFunction("search_products")]
    [Description("Searches the current product catalog using semantic vector search and returns the most relevant grounded products.")]
    public async Task<string> SearchProductsAsync(
        [Description("The user shopping query or preference to search for.")] string query,
        [Description("Maximum number of products to return.")] int topK = 5,
        CancellationToken cancellationToken = default)
    {
        var products = await productVectorService.SearchAsync(query, Math.Clamp(topK, 1, 10), cancellationToken);
        return JsonSerializer.Serialize(products);
    }
}

using Nexus.AI.Service.Models;

namespace Nexus.AI.Service.Services;

public interface IProductCatalogClient
{
    Task<IReadOnlyCollection<ProductCatalogItem>> GetProductsAsync(CancellationToken cancellationToken);
}

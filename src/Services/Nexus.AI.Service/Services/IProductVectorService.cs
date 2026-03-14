using Nexus.AI.Service.Models;

namespace Nexus.AI.Service.Services;

public interface IProductVectorService
{
    Task<IReadOnlyCollection<ProductSearchResult>> SearchAsync(string query, int topK, CancellationToken cancellationToken);
}

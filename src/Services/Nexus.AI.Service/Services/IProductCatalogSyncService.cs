using Nexus.AI.Service.Models;

namespace Nexus.AI.Service.Services;

public interface IProductCatalogSyncService
{
    Task<ProductSyncResult> SyncAsync(CancellationToken cancellationToken);
}

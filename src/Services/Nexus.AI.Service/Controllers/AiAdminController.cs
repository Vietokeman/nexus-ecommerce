using Microsoft.AspNetCore.Mvc;
using Nexus.AI.Service.Models;
using Nexus.AI.Service.Services;

namespace Nexus.AI.Service.Controllers;

[ApiController]
[Route("api/ai/admin")]
public sealed class AiAdminController(
    IProductCatalogSyncService productCatalogSyncService,
    IProductVectorService productVectorService) : ControllerBase
{
    [HttpPost("sync/products")]
    [ProducesResponseType(typeof(ProductSyncResult), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProductSyncResult>> SyncProductsAsync(CancellationToken cancellationToken)
    {
        var result = await productCatalogSyncService.SyncAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("search")]
    [ProducesResponseType(typeof(IReadOnlyCollection<ProductSearchResult>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<ProductSearchResult>>> SearchAsync(
        [FromQuery] string query,
        [FromQuery] int topK = 5,
        CancellationToken cancellationToken = default)
    {
        var result = await productVectorService.SearchAsync(query, Math.Clamp(topK, 1, 10), cancellationToken);
        return Ok(result);
    }
}

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Nexus.AI.Service.Entities;
using Nexus.AI.Service.Models;
using Nexus.AI.Service.Options;
using Nexus.AI.Service.Persistence;
using Pgvector;
using Microsoft.Extensions.Options;

namespace Nexus.AI.Service.Services;

public sealed class ProductCatalogSyncService(
    NexusAiDbContext dbContext,
    IProductCatalogClient productCatalogClient,
    IEmbeddingService embeddingService,
    IOptions<AiOptions> options,
    ILogger<ProductCatalogSyncService> logger) : IProductCatalogSyncService
{
    private readonly ProductCatalogOptions _catalogOptions = options.Value.ProductCatalog;

    public async Task<ProductSyncResult> SyncAsync(CancellationToken cancellationToken)
    {
        var products = await productCatalogClient.GetProductsAsync(cancellationToken);
        var errors = new List<string>();
        var created = 0;
        var updated = 0;
        var failed = 0;
        var now = DateTimeOffset.UtcNow;

        foreach (var batch in products.Chunk(Math.Max(1, _catalogOptions.SyncBatchSize)))
        {
            var productIds = batch.Select(x => x.Id).ToArray();
            var existing = await dbContext.ProductVectors
                .Where(x => productIds.Contains(x.ProductId))
                .ToDictionaryAsync(x => x.ProductId, cancellationToken);

            foreach (var item in batch)
            {
                try
                {
                    var embeddingText = BuildEmbeddingText(item);
                    var embedding = new Vector(await embeddingService.GenerateAsync(embeddingText, cancellationToken));
                    var payload = JsonSerializer.Serialize(item);

                    if (!existing.TryGetValue(item.Id, out var entity))
                    {
                        entity = new ProductVector
                        {
                            ProductId = item.Id,
                            CreatedAtUtc = now
                        };
                        dbContext.ProductVectors.Add(entity);
                        created++;
                    }
                    else
                    {
                        updated++;
                    }

                    entity.ProductNo = item.No;
                    entity.Name = item.Name;
                    entity.Summary = item.Summary;
                    entity.Description = item.Description;
                    entity.Price = item.Price;
                    entity.AttributesJson = item.Attributes;
                    entity.Category = item.Category;
                    entity.ImageUrl = item.ImageUrl;
                    entity.EmbeddingText = embeddingText;
                    entity.SourcePayload = payload;
                    entity.Embedding = embedding;
                    entity.LastSyncedAtUtc = now;
                    entity.UpdatedAtUtc = now;
                }
                catch (Exception exception)
                {
                    failed++;
                    var message = $"Failed to sync product {item.Id} ({item.No}): {exception.Message}";
                    errors.Add(message);
                    logger.LogError(exception, "{Message}", message);
                }
            }

            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return new ProductSyncResult(products.Count, created, updated, failed, DateTimeOffset.UtcNow, errors);
    }

    private static string BuildEmbeddingText(ProductCatalogItem item)
        => string.Join(
            Environment.NewLine,
            new[]
            {
                $"Product No: {item.No}",
                $"Name: {item.Name}",
                $"Category: {item.Category}",
                $"Price: {item.Price}",
                $"Summary: {item.Summary}",
                $"Description: {item.Description}",
                $"Attributes: {item.Attributes}"
            }.Where(value => !string.IsNullOrWhiteSpace(value)));
}

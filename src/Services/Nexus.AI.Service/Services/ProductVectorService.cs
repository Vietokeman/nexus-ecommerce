using Microsoft.EntityFrameworkCore;
using Npgsql;
using Nexus.AI.Service.Models;
using Nexus.AI.Service.Persistence;
using Pgvector;

namespace Nexus.AI.Service.Services;

public sealed class ProductVectorService(
    NexusAiDbContext dbContext,
    IEmbeddingService embeddingService) : IProductVectorService
{
    public async Task<IReadOnlyCollection<ProductSearchResult>> SearchAsync(string query, int topK, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        var embedding = new Vector(await embeddingService.GenerateAsync(query, cancellationToken));
        var vectorParameter = new NpgsqlParameter("embedding", embedding);
        var topKParameter = new NpgsqlParameter("topK", topK);

        var results = await dbContext.Database.SqlQueryRaw<ProductSearchResult>(
            """
            SELECT
                product_id AS "ProductId",
                product_no AS "ProductNo",
                name AS "Name",
                price AS "Price",
                category AS "Category",
                summary AS "Summary",
                image_url AS "ImageUrl",
                CAST(1 - (embedding <=> @embedding) AS double precision) AS "Score"
            FROM product_vectors
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> @embedding
            LIMIT @topK
            """,
            vectorParameter,
            topKParameter)
            .ToListAsync(cancellationToken);

        return results;
    }
}

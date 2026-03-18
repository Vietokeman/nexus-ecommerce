using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Embeddings;

namespace Nexus.AI.Service.Services;

public sealed class GeminiEmbeddingService(Kernel kernel) : IEmbeddingService
{
    public async Task<float[]> GenerateAsync(string input, CancellationToken cancellationToken)
    {
        var generator = kernel.GetRequiredService<ITextEmbeddingGenerationService>();
        var vector = await generator.GenerateEmbeddingAsync(input, cancellationToken: cancellationToken);
        return vector.Span.ToArray();
    }
}

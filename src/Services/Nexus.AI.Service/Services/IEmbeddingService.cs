namespace Nexus.AI.Service.Services;

public interface IEmbeddingService
{
    Task<float[]> GenerateAsync(string input, CancellationToken cancellationToken);
}

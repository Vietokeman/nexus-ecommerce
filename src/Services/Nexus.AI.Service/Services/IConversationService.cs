using Nexus.AI.Service.Models;

namespace Nexus.AI.Service.Services;

public interface IConversationService
{
    Task<ChatResponse> ChatAsync(ChatRequest request, CancellationToken cancellationToken);

    Task<ChatSessionResponse?> GetSessionAsync(Guid sessionId, CancellationToken cancellationToken);
}

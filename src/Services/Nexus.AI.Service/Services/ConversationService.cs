using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Nexus.AI.Service.Entities;
using Nexus.AI.Service.Models;
using Nexus.AI.Service.Options;
using Nexus.AI.Service.Persistence;
using Microsoft.SemanticKernel.Connectors.Google;

namespace Nexus.AI.Service.Services;

public sealed class ConversationService(
    NexusAiDbContext dbContext,
    Kernel kernel,
    IChatCompletionService chatCompletionService,
    IProductVectorService productVectorService,
    IOptions<AiOptions> options) : IConversationService
{
    private readonly AiOptions _options = options.Value;

    public async Task<ChatResponse> ChatAsync(ChatRequest request, CancellationToken cancellationToken)
    {
        var session = await GetOrCreateSessionAsync(request, cancellationToken);
        var grounding = await productVectorService.SearchAsync(
            request.Message,
            request.TopK ?? _options.Chat.DefaultTopK,
            cancellationToken);

        var history = new ChatHistory(_options.Chat.SystemPrompt);
        var messages = await dbContext.ChatMessages
            .Where(x => x.SessionId == session.Id)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(_options.Chat.MaxHistoryMessages)
            .OrderBy(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        foreach (var message in messages)
        {
            history.AddMessage(MapRole(message.Role), message.Content);
        }

        if (grounding.Count > 0)
        {
            history.AddSystemMessage($"Grounding catalog context: {System.Text.Json.JsonSerializer.Serialize(grounding)}");
        }

        history.AddUserMessage(request.Message);

        var settings = new GeminiPromptExecutionSettings
        {
            Temperature = _options.Chat.Temperature,
            TopP = _options.Chat.TopP,
            MaxTokens = _options.Chat.MaxTokens,
            ToolCallBehavior = GeminiToolCallBehavior.AutoInvokeKernelFunctions
        };

        var reply = await chatCompletionService.GetChatMessageContentAsync(history, settings, kernel, cancellationToken);
        var replyContent = reply.Content ?? string.Empty;
        var now = DateTimeOffset.UtcNow;

        dbContext.ChatMessages.AddRange(
            new ChatMessageRecord
            {
                SessionId = session.Id,
                Role = "user",
                Content = request.Message,
                CreatedAtUtc = now
            },
            new ChatMessageRecord
            {
                SessionId = session.Id,
                Role = "assistant",
                Content = replyContent,
                CreatedAtUtc = now
            });

        session.UpdatedAtUtc = now;
        session.LastMessageAtUtc = now;
        await dbContext.SaveChangesAsync(cancellationToken);

        return new ChatResponse(session.Id, replyContent, _options.Google.ChatModelId, grounding, now);
    }

    public async Task<ChatSessionResponse?> GetSessionAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var session = await dbContext.ChatSessions
            .Include(x => x.Messages.OrderBy(m => m.CreatedAtUtc))
            .FirstOrDefaultAsync(x => x.Id == sessionId, cancellationToken);

        if (session is null)
        {
            return null;
        }

        return new ChatSessionResponse(
            session.Id,
            session.UserId,
            session.CreatedAtUtc,
            session.UpdatedAtUtc,
            session.Messages
                .OrderBy(x => x.CreatedAtUtc)
                .Select(x => new ChatMessageDto(x.Id, x.Role, x.Content, x.CreatedAtUtc))
                .ToArray());
    }

    private async Task<ChatSession> GetOrCreateSessionAsync(ChatRequest request, CancellationToken cancellationToken)
    {
        if (request.SessionId.HasValue)
        {
            var existingSession = await dbContext.ChatSessions.FirstOrDefaultAsync(x => x.Id == request.SessionId.Value, cancellationToken);
            if (existingSession is not null)
            {
                return existingSession;
            }
        }

        var now = DateTimeOffset.UtcNow;
        var session = new ChatSession
        {
            Id = request.SessionId ?? Guid.NewGuid(),
            UserId = request.UserId,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
            LastMessageAtUtc = now
        };

        dbContext.ChatSessions.Add(session);
        await dbContext.SaveChangesAsync(cancellationToken);
        return session;
    }

    private static AuthorRole MapRole(string role)
        => role.ToLowerInvariant() switch
        {
            "system" => AuthorRole.System,
            "assistant" => AuthorRole.Assistant,
            "tool" => AuthorRole.Tool,
            "developer" => AuthorRole.Developer,
            _ => AuthorRole.User
        };
}

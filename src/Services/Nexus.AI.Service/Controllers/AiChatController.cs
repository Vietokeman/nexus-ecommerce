using Microsoft.AspNetCore.Mvc;
using Nexus.AI.Service.Models;
using Nexus.AI.Service.Services;

namespace Nexus.AI.Service.Controllers;

[ApiController]
[Route("api/ai/chat")]
public sealed class AiChatController(IConversationService conversationService) : ControllerBase
{
    [HttpPost("sessions")]
    [ProducesResponseType(typeof(ChatResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ChatResponse>> ChatAsync([FromBody] ChatRequest request, CancellationToken cancellationToken)
    {
        var response = await conversationService.ChatAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpGet("sessions/{sessionId:guid}")]
    [ProducesResponseType(typeof(ChatSessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChatSessionResponse>> GetSessionAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var response = await conversationService.GetSessionAsync(sessionId, cancellationToken);
        return response is null ? NotFound() : Ok(response);
    }
}

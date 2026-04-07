using Blogicode.API.DTOs;
using Blogicode.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

/// <summary>
/// Exposes the AI chatbot endpoint powered by an external language model.
/// </summary>
[ApiController]
[Route("api")]
public class ChatbotController : ControllerBase
{
    private readonly IChatService _chat;

    public ChatbotController(IChatService chat) => _chat = chat;

    /// <summary>
    /// Sends a message to the AI chatbot and returns its reply.
    /// </summary>
    /// <param name="body">
    /// Chat payload containing the user's <c>message</c> and an optional <c>history</c> array
    /// of prior turns (each with a <c>role</c> and <c>text</c> field) for multi-turn context.
    /// </param>
    /// <returns>
    /// 200 with <c>reply</c> (the AI response text), <c>source</c> (model identifier), and
    /// <c>hint</c> (optional follow-up suggestion); or 400 if the message is empty.
    /// </returns>
    [HttpPost("chatbot")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Chat([FromBody] ChatRequest body)
    {
        var msg = body.Message?.Trim() ?? "";
        if (string.IsNullOrEmpty(msg))
            return BadRequest(new { error = "Mesaj gerekli", reply = "Lütfen bir mesaj yazın." });

        var (reply, source, hint) = await _chat.ChatAsync(body);
        return Ok(new { reply, source, hint });
    }
}

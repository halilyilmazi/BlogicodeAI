using Blogicode.API.DTOs;
using Blogicode.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

[ApiController]
[Route("api")]
public class ChatbotController : ControllerBase
{
    private readonly IChatService _chat;

    public ChatbotController(IChatService chat) => _chat = chat;

    [HttpPost("chatbot")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest body)
    {
        var msg = body.Message?.Trim() ?? "";
        if (string.IsNullOrEmpty(msg))
            return BadRequest(new { error = "Mesaj gerekli", reply = "Lütfen bir mesaj yazın." });

        var (reply, source, hint) = await _chat.ChatAsync(body);
        return Ok(new { reply, source, hint });
    }
}

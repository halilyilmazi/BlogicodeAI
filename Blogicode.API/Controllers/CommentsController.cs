using Blogicode.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

[ApiController]
[Route("api/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _comments;

    public CommentsController(ICommentService comments) => _comments = comments;

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, [FromQuery] string? authorId)
    {
        var ok = await _comments.DeleteAsync(id, authorId ?? "");
        if (!ok)
            return NotFound(new { message = "Yorum bulunamadı veya yetkisiz." });
        return NoContent();
    }
}

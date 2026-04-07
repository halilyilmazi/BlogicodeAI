using Blogicode.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

/// <summary>
/// Provides direct comment management operations (e.g. deletion by comment ID).
/// For creating and listing comments, see the nested routes on <see cref="PostsController"/>.
/// </summary>
[ApiController]
[Route("api/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _comments;

    public CommentsController(ICommentService comments) => _comments = comments;

    /// <summary>
    /// Deletes a comment by its ID.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the comment to delete.</param>
    /// <param name="authorId">ID of the requesting user — must match the comment's author.</param>
    /// <returns>204 on success, or 404 if the comment is not found or the caller is not the author.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id, [FromQuery] string? authorId)
    {
        var ok = await _comments.DeleteAsync(id, authorId ?? "");
        if (!ok)
            return NotFound(new { message = "Yorum bulunamadı veya yetkisiz." });
        return NoContent();
    }
}

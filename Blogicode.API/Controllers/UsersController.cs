using Blogicode.API.DTOs;
using Blogicode.API.Entities;
using Blogicode.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;

    public UsersController(IUserService users) => _users = users;

    [HttpGet]
    public async Task<IActionResult> ListAll()
    {
        var list = await _users.ListUsersAsync();
        return Ok(list);
    }

    [HttpGet("{id}/favorites")]
    public async Task<IActionResult> Favorites(string id)
    {
        var data = await _users.GetFavoritesAsync(id);
        return Ok(new { data });
    }

    [HttpGet("{id}/likes")]
    public async Task<IActionResult> Likes(string id)
    {
        var data = await _users.GetLikesAsync(id);
        return Ok(new { data });
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> UserComments(string id)
    {
        var data = await _users.GetUserCommentsAsync(id);
        return Ok(new { data });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var (user, posts) = await _users.GetUserWithPostsAsync(id);
        if (user == null)
            return NotFound(new { message = "Kullanıcı bulunamadı." });
        var postDtos = posts.Select(p => PostShape(p)).ToList();
        return Ok(new { user, posts = postDtos });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(string id, [FromBody] UpdateUserRequest body)
    {
        var updated = await _users.UpdateUserAsync(id, body);
        if (updated == null)
            return NotFound(new { message = "Kullanıcı bulunamadı." });
        return Ok(new { message = "Profil başarıyla güncellendi", user = updated });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var ok = await _users.DeleteUserAsync(id);
        if (!ok)
            return StatusCode(500, new { error = "Silinemedi." });
        return NoContent();
    }

    private static object PostShape(Post p) => new
    {
        _id = p.Id.ToString(),
        title = p.Title,
        content = p.Content,
        category = p.Category,
        authorId = p.AuthorId,
        tags = p.Tags,
        likeCount = p.LikeCount,
        favoriteCount = p.FavoriteCount,
        likedBy = p.LikedBy,
        favoritedBy = p.FavoritedBy,
        createdAt = p.CreatedAt,
        updatedAt = p.UpdatedAt
    };
}

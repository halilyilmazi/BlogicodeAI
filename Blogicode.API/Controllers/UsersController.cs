using Blogicode.API.DTOs;
using Blogicode.API.Entities;
using Blogicode.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

/// <summary>
/// Manages user profiles and retrieves per-user activity (posts, likes, favorites, comments).
/// </summary>
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;

    public UsersController(IUserService users) => _users = users;

    /// <summary>
    /// Returns a list of all registered users.
    /// </summary>
    /// <returns>200 with an array of public user objects.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListAll()
    {
        var list = await _users.ListUsersAsync();
        return Ok(list);
    }

    /// <summary>
    /// Returns the posts that a user has marked as favorites.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the user.</param>
    /// <returns>200 with an array of favorited post objects.</returns>
    [HttpGet("{id}/favorites")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Favorites(string id)
    {
        var data = await _users.GetFavoritesAsync(id);
        return Ok(new { data });
    }

    /// <summary>
    /// Returns the posts that a user has liked.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the user.</param>
    /// <returns>200 with an array of liked post objects.</returns>
    [HttpGet("{id}/likes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Likes(string id)
    {
        var data = await _users.GetLikesAsync(id);
        return Ok(new { data });
    }

    /// <summary>
    /// Returns all comments written by a specific user.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the user.</param>
    /// <returns>200 with an array of comment objects enriched with post titles.</returns>
    [HttpGet("{id}/comments")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UserComments(string id)
    {
        var data = await _users.GetUserCommentsAsync(id);
        return Ok(new { data });
    }

    /// <summary>
    /// Returns a user's public profile together with their published posts.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the user.</param>
    /// <returns>200 with the user object and their posts, or 404 if the user does not exist.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(string id)
    {
        var (user, posts) = await _users.GetUserWithPostsAsync(id);
        if (user == null)
            return NotFound(new { message = "Kullanıcı bulunamadı." });
        var postDtos = posts.Select(p => PostShape(p)).ToList();
        return Ok(new { user, posts = postDtos });
    }

    /// <summary>
    /// Updates a user's profile information.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the user to update.</param>
    /// <param name="body">Fields to update: username, bio, profilePhoto, firstName, lastName, profession, gender, birthDate.</param>
    /// <returns>200 with the updated user object, or 404 if the user does not exist.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Put(string id, [FromBody] UpdateUserRequest body)
    {
        var updated = await _users.UpdateUserAsync(id, body);
        if (updated == null)
            return NotFound(new { message = "Kullanıcı bulunamadı." });
        return Ok(new { message = "Profil başarıyla güncellendi", user = updated });
    }

    /// <summary>
    /// Permanently deletes a user account and all associated data.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the user to delete.</param>
    /// <returns>204 on success, or 500 if the deletion fails.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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

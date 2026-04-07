using Blogicode.API.DTOs;
using Blogicode.API.Entities;
using Blogicode.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

/// <summary>
/// Manages blog posts: listing, creating, updating, deleting, reacting, and commenting.
/// </summary>
[ApiController]
[Route("api/posts")]
public class PostsController : ControllerBase
{
    private readonly IPostService _posts;
    private readonly ICommentService _comments;

    public PostsController(IPostService posts, ICommentService comments)
    {
        _posts = posts;
        _comments = comments;
    }

    /// <summary>
    /// Returns a list of all posts, with optional filtering and sorting.
    /// </summary>
    /// <param name="sort">Sort order — e.g. <c>newest</c>, <c>popular</c>.</param>
    /// <param name="topic">Filter by category/topic slug.</param>
    /// <param name="q">Full-text search query applied to title and content.</param>
    /// <returns>200 with an array of post objects.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> List([FromQuery] string? sort, [FromQuery] string? topic, [FromQuery] string? q)
    {
        var data = await _posts.ListAsync(sort, topic, q);
        return Ok(new { data });
    }

    /// <summary>
    /// Creates a new blog post.
    /// </summary>
    /// <param name="body">Post payload: title, content, category, authorId, and optional tags.</param>
    /// <returns>201 with the created post, or 400 if required fields are missing.</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePostRequest body)
    {
        var post = await _posts.CreateAsync(body);
        if (post == null)
            return BadRequest(new { message = "Başlık, içerik ve authorId zorunlu." });
        return StatusCode(201, new { message = "Yazı başarıyla oluşturuldu", post = PostShape(post) });
    }

    /// <summary>
    /// Updates an existing post by ID.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the post to update.</param>
    /// <param name="body">Fields to update: title, content, category, authorId.</param>
    /// <returns>200 with the updated post, or 404 if not found or the caller is not the author.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdatePostRequest body)
    {
        var post = await _posts.UpdateAsync(id, body);
        if (post == null)
            return NotFound(new { message = "Yazı bulunamadı veya yetkisiz." });
        return Ok(new { message = "Güncellendi", post = PostShape(post) });
    }

    /// <summary>
    /// Deletes a post by ID.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the post to delete.</param>
    /// <param name="authorId">ID of the requesting user — must match the post's author.</param>
    /// <returns>204 on success, or 404 if not found or the caller is not the author.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(string id, [FromQuery] string? authorId)
    {
        var ok = await _posts.DeleteAsync(id, authorId ?? "");
        if (!ok)
            return NotFound(new { message = "Yazı bulunamadı veya yetkisiz." });
        return NoContent();
    }

    /// <summary>
    /// Adds or toggles a like or favorite reaction on a post.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the post to react to.</param>
    /// <param name="body">Reaction payload: <c>userId</c> and <c>action</c> (<c>like</c> or <c>favorite</c>).</param>
    /// <returns>200 with the updated post, or 400 if the payload is invalid or the post does not exist.</returns>
    [HttpPost("{id}/react")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> React(string id, [FromBody] ReactRequest body)
    {
        var post = await _posts.ReactAsync(id, body);
        if (post == null)
            return BadRequest(new { message = "userId ve action (like|favorite) gerekli veya yazı yok." });
        return Ok(new { message = "Tamam", post = PostShape(post) });
    }

    /// <summary>
    /// Returns all comments for a specific post.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the post.</param>
    /// <returns>200 with an array of comment objects.</returns>
    [HttpGet("{id}/comments")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetComments(string id)
    {
        var list = await _comments.ListByPostAsync(id);
        var data = list.Select(c => new
        {
            _id = c.Id.ToString(),
            postId = c.PostId,
            authorId = c.AuthorId,
            content = c.Content,
            createdAt = c.CreatedAt,
            updatedAt = c.UpdatedAt
        }).ToList();
        return Ok(new { data });
    }

    /// <summary>
    /// Adds a new comment to a post.
    /// </summary>
    /// <param name="id">MongoDB ObjectId of the post to comment on.</param>
    /// <param name="body">Comment payload: content and authorId.</param>
    /// <returns>201 with the created comment, or 400 if required fields are missing or the post does not exist.</returns>
    [HttpPost("{id}/comments")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddComment(string id, [FromBody] CreateCommentRequest body)
    {
        var c = await _comments.CreateAsync(id, body);
        if (c == null)
            return BadRequest(new { message = "Yorum veya kullanıcı eksik / yazı yok." });
        return StatusCode(201, new
        {
            message = "Yorum başarıyla eklendi",
            comment = new
            {
                _id = c.Id.ToString(),
                postId = c.PostId,
                authorId = c.AuthorId,
                content = c.Content,
                createdAt = c.CreatedAt,
                updatedAt = c.UpdatedAt
            }
        });
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

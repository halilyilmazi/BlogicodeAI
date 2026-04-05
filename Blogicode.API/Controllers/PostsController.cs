using Blogicode.API.DTOs;
using Blogicode.API.Entities;
using Blogicode.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Blogicode.API.Controllers;

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

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? sort, [FromQuery] string? topic, [FromQuery] string? q)
    {
        var data = await _posts.ListAsync(sort, topic, q);
        return Ok(new { data });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePostRequest body)
    {
        var post = await _posts.CreateAsync(body);
        if (post == null)
            return BadRequest(new { message = "Başlık, içerik ve authorId zorunlu." });
        return StatusCode(201, new { message = "Yazı başarıyla oluşturuldu", post = PostShape(post) });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdatePostRequest body)
    {
        var post = await _posts.UpdateAsync(id, body);
        if (post == null)
            return NotFound(new { message = "Yazı bulunamadı veya yetkisiz." });
        return Ok(new { message = "Güncellendi", post = PostShape(post) });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, [FromQuery] string? authorId)
    {
        var ok = await _posts.DeleteAsync(id, authorId ?? "");
        if (!ok)
            return NotFound(new { message = "Yazı bulunamadı veya yetkisiz." });
        return NoContent();
    }

    [HttpPost("{id}/react")]
    public async Task<IActionResult> React(string id, [FromBody] ReactRequest body)
    {
        var post = await _posts.ReactAsync(id, body);
        if (post == null)
            return BadRequest(new { message = "userId ve action (like|favorite) gerekli veya yazı yok." });
        return Ok(new { message = "Tamam", post = PostShape(post) });
    }

    [HttpGet("{id}/comments")]
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

    [HttpPost("{id}/comments")]
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

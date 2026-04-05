using Blogicode.API.Data;
using Blogicode.API.DTOs;
using Blogicode.API.Entities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Blogicode.API.Services;

public class CommentService : ICommentService
{
    private readonly IMongoDbContext _db;

    public CommentService(IMongoDbContext db) => _db = db;

    public async Task<List<Comment>> ListByPostAsync(string postId)
    {
        return await _db.Comments.Find(c => c.PostId == postId).SortByDescending(c => c.CreatedAt).ToListAsync();
    }

    public async Task<Comment?> CreateAsync(string postId, CreateCommentRequest req)
    {
        var content = req.Content?.Trim() ?? "";
        var authorId = req.AuthorId?.Trim() ?? "";
        if (string.IsNullOrEmpty(content) || string.IsNullOrEmpty(authorId))
            return null;
        if (!ObjectId.TryParse(postId, out var pid))
            return null;
        var post = await _db.Posts.Find(p => p.Id == pid).FirstOrDefaultAsync();
        if (post == null)
            return null;

        var now = DateTime.UtcNow;
        var c = new Comment
        {
            Id = ObjectId.GenerateNewId(),
            PostId = postId,
            AuthorId = authorId,
            Content = content,
            CreatedAt = now,
            UpdatedAt = now
        };
        await _db.Comments.InsertOneAsync(c);
        return c;
    }

    public async Task<bool> DeleteAsync(string commentId, string authorId)
    {
        if (!ObjectId.TryParse(commentId, out var oid))
            return false;
        var c = await _db.Comments.Find(x => x.Id == oid).FirstOrDefaultAsync();
        if (c == null || string.IsNullOrEmpty(authorId) || c.AuthorId != authorId)
            return false;
        await _db.Comments.DeleteOneAsync(x => x.Id == oid);
        return true;
    }
}

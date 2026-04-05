using System.Text.RegularExpressions;
using Blogicode.API.Data;
using Blogicode.API.DTOs;
using Blogicode.API.Entities;
using Blogicode.API.Helpers;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Blogicode.API.Services;

public class PostService : IPostService
{
    private readonly IMongoDbContext _db;

    public PostService(IMongoDbContext db) => _db = db;

    private static bool PostMatchesTopic(Post p, string[] kws)
    {
        foreach (var kw in kws)
        {
            var rx = new Regex(RegexHelper.EscapeRegex(kw), RegexOptions.IgnoreCase);
            if (rx.IsMatch(p.Title)) return true;
            if (p.Category != null && rx.IsMatch(p.Category)) return true;
            if (rx.IsMatch(p.Content)) return true;
            if (p.Tags != null && p.Tags.Any(t => rx.IsMatch(t))) return true;
        }
        return false;
    }

    public async Task<List<PostResponseDto>> ListAsync(string? sort, string? topic, string? q)
    {
        var all = await _db.Posts.Find(_ => true).ToListAsync();
        IEnumerable<Post> query = all;

        if (!string.IsNullOrWhiteSpace(topic))
        {
            if (!TopicKeywords.IsKnownTopic(topic))
                return new List<PostResponseDto>();
            var kws = TopicKeywords.Map[topic];
            query = query.Where(p => PostMatchesTopic(p, kws));
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var rx = new Regex(RegexHelper.EscapeRegex(q), RegexOptions.IgnoreCase);
            query = query.Where(p =>
                rx.IsMatch(p.Title) ||
                rx.IsMatch(p.Content) ||
                (p.Category != null && rx.IsMatch(p.Category)) ||
                (p.Tags != null && p.Tags.Any(t => rx.IsMatch(t))));
        }

        var posts = query.ToList();
        var allComments = await _db.Comments.Find(_ => true).ToListAsync();
        var countByPost = allComments.GroupBy(c => c.PostId).ToDictionary(g => g.Key, g => g.Count());

        var sortKey = (sort ?? "recent").ToLowerInvariant();
        IEnumerable<Post> ordered = sortKey switch
        {
            "popular" => posts.OrderByDescending(p =>
            {
                var cc = countByPost.GetValueOrDefault(p.Id.ToString(), 0);
                return p.LikeCount + p.FavoriteCount + cc;
            }).ThenByDescending(p => p.CreatedAt),
            "oldest" => posts.OrderBy(p => p.CreatedAt),
            _ => posts.OrderByDescending(p => p.CreatedAt)
        };

        return ordered.Select(p =>
            PostFormatter.ToListItem(p, countByPost.GetValueOrDefault(p.Id.ToString(), 0))).ToList();
    }

    public async Task<Post?> CreateAsync(CreatePostRequest req)
    {
        var title = req.Title?.Trim() ?? "";
        var content = req.Content?.Trim() ?? "";
        var authorId = req.AuthorId?.Trim() ?? "";
        if (string.IsNullOrEmpty(title) || string.IsNullOrEmpty(content) || string.IsNullOrEmpty(authorId))
            return null;

        var now = DateTime.UtcNow;
        var post = new Post
        {
            Id = ObjectId.GenerateNewId(),
            Title = title,
            Content = content,
            Category = req.Category?.Trim(),
            AuthorId = authorId,
            Tags = req.Tags ?? new List<string>(),
            LikeCount = 0,
            FavoriteCount = 0,
            LikedBy = new List<string>(),
            FavoritedBy = new List<string>(),
            CreatedAt = now,
            UpdatedAt = now
        };
        await _db.Posts.InsertOneAsync(post);
        return post;
    }

    public async Task<Post?> UpdateAsync(string id, UpdatePostRequest req)
    {
        if (!ObjectId.TryParse(id, out var oid))
            return null;
        var post = await _db.Posts.Find(p => p.Id == oid).FirstOrDefaultAsync();
        if (post == null)
            return null;
        if (string.IsNullOrEmpty(req.AuthorId) || post.AuthorId != req.AuthorId)
            return null;

        if (req.Title != null) post.Title = req.Title;
        if (req.Content != null) post.Content = req.Content;
        if (req.Category != null) post.Category = req.Category;
        post.UpdatedAt = DateTime.UtcNow;
        await _db.Posts.ReplaceOneAsync(p => p.Id == oid, post);
        return post;
    }

    public async Task<bool> DeleteAsync(string id, string authorId)
    {
        if (!ObjectId.TryParse(id, out var oid))
            return false;
        var post = await _db.Posts.Find(p => p.Id == oid).FirstOrDefaultAsync();
        if (post == null || string.IsNullOrEmpty(authorId) || post.AuthorId != authorId)
            return false;
        await _db.Comments.DeleteManyAsync(c => c.PostId == id);
        await _db.Posts.DeleteOneAsync(p => p.Id == oid);
        return true;
    }

    public async Task<Post?> ReactAsync(string id, ReactRequest req)
    {
        if (!ObjectId.TryParse(id, out var oid))
            return null;
        if (string.IsNullOrEmpty(req.UserId) || (req.Action != "like" && req.Action != "favorite"))
            return null;
        var post = await _db.Posts.Find(p => p.Id == oid).FirstOrDefaultAsync();
        if (post == null)
            return null;

        var listField = req.Action == "like" ? post.LikedBy : post.FavoritedBy;
        if (listField.Contains(req.UserId))
            return post;

        if (req.Action == "like")
        {
            post.LikedBy = new List<string>(post.LikedBy) { req.UserId };
            post.LikeCount++;
        }
        else
        {
            post.FavoritedBy = new List<string>(post.FavoritedBy) { req.UserId };
            post.FavoriteCount++;
        }
        post.UpdatedAt = DateTime.UtcNow;
        await _db.Posts.ReplaceOneAsync(p => p.Id == oid, post);
        return post;
    }
}

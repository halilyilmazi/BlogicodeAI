using Blogicode.API.Data;
using Blogicode.API.DTOs;
using Blogicode.API.Entities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Blogicode.API.Services;

public class UserService : IUserService
{
    private readonly IMongoDbContext _db;

    public UserService(IMongoDbContext db) => _db = db;

    public async Task<(UserPublicDto? user, List<Post> posts)> GetUserWithPostsAsync(string id)
    {
        if (!ObjectId.TryParse(id, out var oid))
            return (null, new List<Post>());
        var user = await _db.Users.Find(u => u.Id == oid).FirstOrDefaultAsync();
        if (user == null)
            return (null, new List<Post>());
        var posts = await _db.Posts.Find(p => p.AuthorId == id).ToListAsync();
        return (UserMapper.ToPublic(user), posts);
    }

    public async Task<UserPublicDto?> UpdateUserAsync(string id, UpdateUserRequest req)
    {
        if (!ObjectId.TryParse(id, out var oid))
            return null;
        var updates = new List<UpdateDefinition<User>>();

        if (req.Username != null) updates.Add(Builders<User>.Update.Set(u => u.Username, req.Username));
        if (req.Bio != null) updates.Add(Builders<User>.Update.Set(u => u.Bio, req.Bio));
        if (req.ProfilePhoto != null) updates.Add(Builders<User>.Update.Set(u => u.ProfilePhoto, req.ProfilePhoto));
        if (req.FirstName != null) updates.Add(Builders<User>.Update.Set(u => u.FirstName, req.FirstName));
        if (req.LastName != null) updates.Add(Builders<User>.Update.Set(u => u.LastName, req.LastName));
        if (req.Profession != null) updates.Add(Builders<User>.Update.Set(u => u.Profession, req.Profession));
        if (req.Gender != null) updates.Add(Builders<User>.Update.Set(u => u.Gender, req.Gender));
        if (req.BirthDate != null) updates.Add(Builders<User>.Update.Set(u => u.BirthDate, req.BirthDate));

        if (updates.Count == 0)
        {
            var u0 = await _db.Users.Find(x => x.Id == oid).FirstOrDefaultAsync();
            return u0 == null ? null : UserMapper.ToPublic(u0);
        }

        updates.Add(Builders<User>.Update.Set(u => u.UpdatedAt, DateTime.UtcNow));
        var combined = Builders<User>.Update.Combine(updates);
        var filter = Builders<User>.Filter.Eq(u => u.Id, oid);
        var opt = new FindOneAndUpdateOptions<User, User> { ReturnDocument = ReturnDocument.After };
        var updated = await _db.Users.FindOneAndUpdateAsync(filter, combined, opt, CancellationToken.None);
        return updated == null ? null : UserMapper.ToPublic(updated);
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        if (!ObjectId.TryParse(id, out var oid))
            return false;
        var posts = await _db.Posts.Find(p => p.AuthorId == id).ToListAsync();
        var postIds = posts.Select(p => p.Id.ToString()).ToList();
        await _db.Comments.DeleteManyAsync(c => c.AuthorId == id || postIds.Contains(c.PostId));
        await _db.Posts.DeleteManyAsync(p => p.AuthorId == id);
        var dr = await _db.Users.DeleteOneAsync(u => u.Id == oid);
        return dr.DeletedCount > 0;
    }

    public async Task<List<UserPublicDto>> ListUsersAsync()
    {
        var users = await _db.Users.Find(_ => true).SortByDescending(u => u.CreatedAt).ToListAsync();
        return users.Select(UserMapper.ToPublic).ToList();
    }

    public async Task<List<object>> GetFavoritesAsync(string userId)
    {
        var posts = await _db.Posts.Find(p => p.FavoritedBy.Contains(userId)).SortByDescending(p => p.CreatedAt).ToListAsync();
        var allComments = await _db.Comments.Find(_ => true).ToListAsync();
        var countByPost = allComments.GroupBy(c => c.PostId).ToDictionary(g => g.Key, g => g.Count());

        return posts.Select(p => PostFormatter.ToListItem(p, countByPost.GetValueOrDefault(p.Id.ToString(), 0))).Cast<object>().ToList();
    }

    public async Task<List<object>> GetLikesAsync(string userId)
    {
        var posts = await _db.Posts.Find(p => p.LikedBy.Contains(userId)).SortByDescending(p => p.CreatedAt).ToListAsync();
        var allComments = await _db.Comments.Find(_ => true).ToListAsync();
        var countByPost = allComments.GroupBy(c => c.PostId).ToDictionary(g => g.Key, g => g.Count());

        return posts.Select(p => PostFormatter.ToListItem(p, countByPost.GetValueOrDefault(p.Id.ToString(), 0))).Cast<object>().ToList();
    }

    public async Task<List<MyCommentDto>> GetUserCommentsAsync(string userId)
    {
        var comments = await _db.Comments.Find(c => c.AuthorId == userId).SortByDescending(c => c.CreatedAt).ToListAsync();
        var list = new List<MyCommentDto>();
        foreach (var c in comments)
        {
            var title = "(silinmiş yazı)";
            if (ObjectId.TryParse(c.PostId, out var pid))
            {
                var post = await _db.Posts.Find(x => x.Id == pid).FirstOrDefaultAsync();
                if (post?.Title != null) title = post.Title;
            }
            list.Add(new MyCommentDto
            {
                Id = c.Id.ToString(),
                PostId = c.PostId,
                PostTitle = title,
                Content = c.Content,
                CreatedAt = c.CreatedAt
            });
        }
        return list;
    }
}

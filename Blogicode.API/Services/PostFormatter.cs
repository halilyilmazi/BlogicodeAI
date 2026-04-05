using Blogicode.API.DTOs;
using Blogicode.API.Entities;

namespace Blogicode.API.Services;

public static class PostFormatter
{
    public static PostResponseDto ToListItem(Post p, int commentCount)
    {
        var lc = p.LikeCount;
        var fc = p.FavoriteCount;
        return new PostResponseDto
        {
            Id = p.Id.ToString(),
            Title = p.Title,
            Content = p.Content,
            Category = p.Category,
            AuthorId = p.AuthorId,
            Tags = p.Tags ?? new List<string>(),
            LikeCount = lc,
            FavoriteCount = fc,
            CommentCount = commentCount,
            Popularity = lc + fc + commentCount,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}

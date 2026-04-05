using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Blogicode.API.Entities;

[BsonIgnoreExtraElements]
public class Post
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("title")]
    public string Title { get; set; } = "";

    [BsonElement("content")]
    public string Content { get; set; } = "";

    [BsonElement("category")]
    public string? Category { get; set; }

    [BsonElement("authorId")]
    public string AuthorId { get; set; } = "";

    [BsonElement("tags")]
    public List<string> Tags { get; set; } = new();

    [BsonElement("likeCount")]
    public int LikeCount { get; set; }

    [BsonElement("favoriteCount")]
    public int FavoriteCount { get; set; }

    [BsonElement("likedBy")]
    public List<string> LikedBy { get; set; } = new();

    [BsonElement("favoritedBy")]
    public List<string> FavoritedBy { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime? CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; }
}

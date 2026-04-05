using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Blogicode.API.Entities;

[BsonIgnoreExtraElements]
public class Comment
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("postId")]
    public string PostId { get; set; } = "";

    [BsonElement("authorId")]
    public string AuthorId { get; set; } = "";

    [BsonElement("content")]
    public string Content { get; set; } = "";

    [BsonElement("createdAt")]
    public DateTime? CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; }
}

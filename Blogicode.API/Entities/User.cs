using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Blogicode.API.Entities;

[BsonIgnoreExtraElements]
public class User
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("firstName")]
    public string FirstName { get; set; } = "";

    [BsonElement("lastName")]
    public string LastName { get; set; } = "";

    [BsonElement("email")]
    public string Email { get; set; } = "";

    [BsonElement("password")]
    public string Password { get; set; } = "";

    [BsonElement("username")]
    public string Username { get; set; } = "";

    [BsonElement("bio")]
    public string Bio { get; set; } = "";

    [BsonElement("profession")]
    public string Profession { get; set; } = "";

    [BsonElement("gender")]
    public string Gender { get; set; } = "";

    [BsonElement("birthDate")]
    public string BirthDate { get; set; } = "";

    [BsonElement("profilePhoto")]
    public string ProfilePhoto { get; set; } = "";

    [BsonElement("createdAt")]
    public DateTime? CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; }
}

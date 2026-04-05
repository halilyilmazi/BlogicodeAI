using System.Text.Json.Serialization;

namespace Blogicode.API.DTOs;

public class RegisterRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
}

public class LoginRequest
{
    public string? Email { get; set; }
    public string? Password { get; set; }
}

public class UserPublicDto
{
    [JsonPropertyName("_id")]
    public string Id { get; set; } = "";

    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Username { get; set; } = "";
    public string Bio { get; set; } = "";
    public string Profession { get; set; } = "";
    public string Gender { get; set; } = "";
    public string BirthDate { get; set; } = "";
    public string ProfilePhoto { get; set; } = "";
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class UpdateUserRequest
{
    public string? Username { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePhoto { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Profession { get; set; }
    public string? Gender { get; set; }
    public string? BirthDate { get; set; }
}

public class CreatePostRequest
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? Category { get; set; }
    public string? AuthorId { get; set; }
    public List<string>? Tags { get; set; }
}

public class UpdatePostRequest
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? Category { get; set; }
    public string? AuthorId { get; set; }
}

public class ReactRequest
{
    public string? UserId { get; set; }
    public string? Action { get; set; }
}

public class CreateCommentRequest
{
    public string? Content { get; set; }
    public string? AuthorId { get; set; }
}

public class ChatRequest
{
    public string? Message { get; set; }
    public List<ChatHistoryItem>? History { get; set; }
}

public class ChatHistoryItem
{
    public string? Role { get; set; }
    public string? Text { get; set; }
}

public class MyCommentDto
{
    [JsonPropertyName("_id")]
    public string Id { get; set; } = "";
    public string PostId { get; set; } = "";
    public string PostTitle { get; set; } = "";
    public string Content { get; set; } = "";
    public DateTime? CreatedAt { get; set; }
}

/// <summary>GET /api/posts listesi (Node aggregate çıktısına yakın).</summary>
public class PostResponseDto
{
    [JsonPropertyName("_id")]
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string? Category { get; set; }
    public string AuthorId { get; set; } = "";
    public List<string> Tags { get; set; } = new();
    public int LikeCount { get; set; }
    public int FavoriteCount { get; set; }
    public int CommentCount { get; set; }
    public int Popularity { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

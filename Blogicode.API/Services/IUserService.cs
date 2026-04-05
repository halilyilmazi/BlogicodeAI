using Blogicode.API.DTOs;
using Blogicode.API.Entities;

namespace Blogicode.API.Services;

public interface IUserService
{
    Task<(UserPublicDto? user, List<Post> posts)> GetUserWithPostsAsync(string id);
    Task<UserPublicDto?> UpdateUserAsync(string id, UpdateUserRequest req);
    Task<bool> DeleteUserAsync(string id);
    Task<List<UserPublicDto>> ListUsersAsync();
    Task<List<object>> GetFavoritesAsync(string userId);
    Task<List<MyCommentDto>> GetUserCommentsAsync(string userId);
}

using Blogicode.API.DTOs;
using Blogicode.API.Entities;

namespace Blogicode.API.Services;

public interface IPostService
{
    Task<List<PostResponseDto>> ListAsync(string? sort, string? topic, string? q);
    Task<Post?> CreateAsync(CreatePostRequest req);
    Task<Post?> UpdateAsync(string id, UpdatePostRequest req);
    Task<bool> DeleteAsync(string id, string authorId);
    Task<Post?> ReactAsync(string id, ReactRequest req);
}

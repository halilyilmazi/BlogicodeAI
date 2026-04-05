using Blogicode.API.DTOs;
using Blogicode.API.Entities;

namespace Blogicode.API.Services;

public interface ICommentService
{
    Task<List<Comment>> ListByPostAsync(string postId);
    Task<Comment?> CreateAsync(string postId, CreateCommentRequest req);
    Task<bool> DeleteAsync(string commentId, string authorId);
}

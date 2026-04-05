using Blogicode.API.DTOs;

namespace Blogicode.API.Services;

public interface IChatService
{
    Task<(string reply, string source, string? hint)> ChatAsync(ChatRequest req);
}

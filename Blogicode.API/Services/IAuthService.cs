using Blogicode.API.DTOs;

namespace Blogicode.API.Services;

public interface IAuthService
{
    Task<(bool ok, string? error, UserPublicDto? user)> RegisterAsync(RegisterRequest req);
    Task<(bool ok, UserPublicDto? user)> LoginAsync(LoginRequest req);
}

using Blogicode.API.Data;
using Blogicode.API.DTOs;
using Blogicode.API.Entities;
using MongoDB.Driver;

namespace Blogicode.API.Services;

public class AuthService : IAuthService
{
    private readonly IMongoDbContext _db;

    public AuthService(IMongoDbContext db) => _db = db;

    public async Task<(bool ok, string? error, UserPublicDto? user)> RegisterAsync(RegisterRequest req)
    {
        var fn = req.FirstName?.Trim() ?? "";
        var ln = req.LastName?.Trim() ?? "";
        var em = req.Email?.Trim() ?? "";
        var pw = req.Password ?? "";

        if (string.IsNullOrEmpty(fn) || string.IsNullOrEmpty(ln))
            return (false, "Ad ve soyad zorunludur.", null);
        if (string.IsNullOrEmpty(em) || string.IsNullOrWhiteSpace(pw))
            return (false, "E-posta ve şifre zorunludur.", null);

        var exists = await _db.Users.Find(u => u.Email == em).AnyAsync();
        if (exists)
            return (false, "Bu email adresi zaten kullanımda.", null);

        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId(),
            FirstName = fn,
            LastName = ln,
            Email = em,
            Password = pw,
            CreatedAt = now,
            UpdatedAt = now
        };
        await _db.Users.InsertOneAsync(user);
        return (true, null, UserMapper.ToPublic(user));
    }

    public async Task<(bool ok, UserPublicDto? user)> LoginAsync(LoginRequest req)
    {
        var em = req.Email?.Trim() ?? "";
        var pw = req.Password ?? "";
        if (string.IsNullOrEmpty(em) || string.IsNullOrEmpty(pw))
            return (false, null);

        var user = await _db.Users.Find(u => u.Email == em && u.Password == pw).FirstOrDefaultAsync();
        return user == null ? (false, null) : (true, UserMapper.ToPublic(user));
    }
}

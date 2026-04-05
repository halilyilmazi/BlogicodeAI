using Blogicode.API.DTOs;
using Blogicode.API.Entities;

namespace Blogicode.API.Services;

public static class UserMapper
{
    public static UserPublicDto ToPublic(User u) => new()
    {
        Id = u.Id.ToString(),
        FirstName = u.FirstName,
        LastName = u.LastName,
        Email = u.Email,
        Username = u.Username,
        Bio = u.Bio,
        Profession = u.Profession,
        Gender = u.Gender,
        BirthDate = u.BirthDate,
        ProfilePhoto = u.ProfilePhoto,
        CreatedAt = u.CreatedAt,
        UpdatedAt = u.UpdatedAt
    };
}

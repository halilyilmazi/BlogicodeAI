using Blogicode.API.Entities;
using MongoDB.Driver;

namespace Blogicode.API.Data;

public interface IMongoDbContext
{
    IMongoCollection<User> Users { get; }
    IMongoCollection<Post> Posts { get; }
    IMongoCollection<Comment> Comments { get; }
}

using Blogicode.API.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Blogicode.API.Data;

public class MongoDbContext : IMongoDbContext
{
    public IMongoCollection<User> Users { get; }
    public IMongoCollection<Post> Posts { get; }
    public IMongoCollection<Comment> Comments { get; }

    public MongoDbContext(IOptions<MongoDbSettings> options)
    {
        var s = options.Value;
        var client = new MongoClient(s.ConnectionString);
        var db = client.GetDatabase(s.DatabaseName);
        Users = db.GetCollection<User>("users");
        Posts = db.GetCollection<Post>("posts");
        Comments = db.GetCollection<Comment>("comments");
    }
}

namespace Infrastructure.Repositories;

//public class MessageRepository(AppDbContext context) : BaseRepository<Message>(context), IMessageRepository { }
public class MessageRepository : MongoBaseRepository<Message>, IMessageRepository
{
    public MessageRepository(MongoDbContext context, string dbName) : base(context, dbName) { }
}
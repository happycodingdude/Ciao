namespace Infrastructure.Repositories;

//public class MessageRepository(AppDbContext context) : BaseRepository<Message>(context), IMessageRepository { }
// public class MessageRepository : MongoBaseRepository<Message>, IMessageRepository
// {
//     public MessageRepository(MongoDbContext context) : base(context) { }
// }
public class MessageRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor) : MongoBaseRepository<Message>(context, uow, httpContextAccessor), IMessageRepository { }
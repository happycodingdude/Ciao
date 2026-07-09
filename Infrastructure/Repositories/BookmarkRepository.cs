namespace Infrastructure.Repositories;

public class BookmarkRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Bookmark>(context, uow), IBookmarkRepository { }


namespace Infrastructure.Repositories;

public class MemberRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Member>(context, uow), IMemberRepository { }
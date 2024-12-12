namespace Infrastructure.Repositories;

public class ScheduleContactRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<ScheduleContact>(context, uow), IScheduleContactRepository { }
namespace Infrastructure.Repositories;

public class ScheduleRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Schedule>(context, uow), IScheduleRepository { }
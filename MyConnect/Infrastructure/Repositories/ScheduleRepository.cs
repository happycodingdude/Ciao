namespace Infrastructure.Repositories;

// public class ScheduleRepository(AppDbContext context) : BaseRepository<Schedule>(context), IScheduleRepository { }
public class ScheduleRepository(MongoDbContext context, IUnitOfWork uow) : MongoBaseRepository<Schedule>(context, uow), IScheduleRepository { }
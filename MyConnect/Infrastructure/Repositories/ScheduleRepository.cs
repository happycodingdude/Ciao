namespace Infrastructure.Repositories;

// public class ScheduleRepository(AppDbContext context) : BaseRepository<Schedule>(context), IScheduleRepository { }
public class ScheduleRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor) : MongoBaseRepository<Schedule>(context, uow, httpContextAccessor), IScheduleRepository { }
namespace Infrastructure.Repositories;

// public class ScheduleContactRepository(AppDbContext context) : BaseRepository<ScheduleContact>(context), IScheduleContactRepository { }
public class ScheduleContactRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor) : MongoBaseRepository<ScheduleContact>(context, uow, httpContextAccessor), IScheduleContactRepository { }
// public class ScheduleContactRepository : MongoBaseRepository<ScheduleContact>, IScheduleContactRepository
// {
//     public ScheduleContactRepository(MongoDbContext context) : base(context) { }
// }
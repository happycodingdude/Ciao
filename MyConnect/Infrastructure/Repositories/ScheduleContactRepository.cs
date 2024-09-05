namespace Infrastructure.Repositories;

// public class ScheduleContactRepository(AppDbContext context) : BaseRepository<ScheduleContact>(context), IScheduleContactRepository { }
public class ScheduleContactRepository : MongoBaseRepository<ScheduleContact>, IScheduleContactRepository
{
    public ScheduleContactRepository(MongoDbContext context) : base(context) { }
}
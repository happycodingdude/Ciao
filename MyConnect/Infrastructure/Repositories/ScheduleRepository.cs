namespace Infrastructure.Repositories;

// public class ScheduleRepository(AppDbContext context) : BaseRepository<Schedule>(context), IScheduleRepository { }
public class ScheduleRepository : MongoBaseRepository<Schedule>, IScheduleRepository
{
    public ScheduleRepository(MongoDbContext context) : base(context) { }
}
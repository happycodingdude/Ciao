namespace Infrastructure.Repositories;

public class ScheduleRepository : BaseRepository<Schedule>, IScheduleRepository
{
    public ScheduleRepository(AppDbContext context) : base(context) { }
}
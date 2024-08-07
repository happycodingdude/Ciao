namespace Infrastructure.Repositories;

public class ScheduleContactRepository : BaseRepository<ScheduleContact>, IScheduleContactRepository
{
    public ScheduleContactRepository(AppDbContext context) : base(context) { }
}
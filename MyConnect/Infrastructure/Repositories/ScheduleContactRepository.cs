namespace Infrastructure.Repositories;

public class ScheduleContactRepository(AppDbContext context) : BaseRepository<ScheduleContact>(context), IScheduleContactRepository { }
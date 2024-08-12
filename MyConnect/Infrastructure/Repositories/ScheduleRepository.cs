namespace Infrastructure.Repositories;

public class ScheduleRepository(AppDbContext context) : BaseRepository<Schedule>(context), IScheduleRepository { }
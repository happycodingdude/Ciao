namespace Infrastructure.Repositories;

public class ScheduleRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<Schedule>(context, httpContextAccessor), IScheduleRepository
{ }
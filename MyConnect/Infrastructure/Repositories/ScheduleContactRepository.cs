namespace Infrastructure.Repositories;

public class ScheduleContactRepository(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<ScheduleContact>(context, httpContextAccessor), IScheduleContactRepository
{ }
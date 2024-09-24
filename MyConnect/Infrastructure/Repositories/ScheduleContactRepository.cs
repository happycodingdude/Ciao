namespace Infrastructure.Repositories;

public class ScheduleContactRepository(MongoDbContext context, IUnitOfWork uow, IHttpContextAccessor httpContextAccessor)
    : MongoBaseRepository<ScheduleContact>(context, uow, httpContextAccessor), IScheduleContactRepository
{ }
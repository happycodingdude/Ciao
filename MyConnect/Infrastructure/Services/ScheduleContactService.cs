namespace Infrastructure.Services;

public class ScheduleContactService : BaseService<ScheduleContact, ScheduleContactDto>, IScheduleContactService
{
    public ScheduleContactService(IScheduleContactRepository repo, IUnitOfWork unitOfWork, IMapper mapper) : base(repo, unitOfWork, mapper)
    {
    }
}
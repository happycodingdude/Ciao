namespace Infrastructure.Services;

public class ScheduleService : BaseService<Schedule, ScheduleDto>, IScheduleService
{
    public ScheduleService(IScheduleRepository repo, IUnitOfWork unitOfWork, IMapper mapper) : base(repo, unitOfWork, mapper)
    {
    }
}
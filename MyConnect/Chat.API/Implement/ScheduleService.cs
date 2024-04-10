using AutoMapper;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.Repository;
using MyConnect.UOW;

namespace MyConnect.Implement
{
    public class ScheduleService : BaseService<Schedule, ScheduleDto>, IScheduleService
    {
        public ScheduleService(IScheduleRepository repo,
        IUnitOfWork unitOfWork,
        IMapper mapper) : base(repo, unitOfWork, mapper)
        {
        }
    }
}
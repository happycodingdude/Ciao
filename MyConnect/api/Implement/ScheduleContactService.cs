using AutoMapper;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.Repository;
using MyConnect.UOW;

namespace MyConnect.Implement
{
    public class ScheduleContactService : BaseService<ScheduleContact, ScheduleContactDto>, IScheduleContactService
    {
        public ScheduleContactService(IScheduleContactRepository repo,
        IUnitOfWork unitOfWork,
        IMapper mapper) : base(repo, unitOfWork, mapper)
        {
        }
    }
}
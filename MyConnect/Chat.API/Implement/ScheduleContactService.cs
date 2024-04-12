using AutoMapper;
using Chat.API.Interface;
using Chat.API.Model;
using Chat.API.Repository;
using Chat.API.UOW;

namespace Chat.API.Implement
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
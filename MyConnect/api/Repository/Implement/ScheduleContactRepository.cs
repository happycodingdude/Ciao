using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ScheduleContactRepository : BaseRepository<ScheduleContact>, IScheduleContactRepository
    {
        public ScheduleContactRepository(CoreContext context) : base(context) { }
    }
}
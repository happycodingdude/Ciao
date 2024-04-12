namespace Chat.API.Repository
{
    public class ScheduleContactRepository : BaseRepository<ScheduleContact>, IScheduleContactRepository
    {
        public ScheduleContactRepository(CoreContext context) : base(context) { }
    }
}
namespace Chat.API.Repository
{
    public class ScheduleRepository : BaseRepository<Schedule>, IScheduleRepository
    {
        public ScheduleRepository(CoreContext context) : base(context) { }
    }
}
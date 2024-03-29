using MyConnect.Authentication;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class NotificationRepository : BaseRepository<Notification>, INotificationRepository
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public NotificationRepository(CoreContext context, IHttpContextAccessor httpContextAccessor) : base(context)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public override IEnumerable<Notification> GetAll(int page, int limit)
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var id = JwtToken.ExtractToken(token);
            return _dbSet.Where(q => q.ContactId == id).OrderByDescending(q => q.CreatedTime).Skip(limit * (page - 1)).Take(limit).ToList();
        }
    }
}
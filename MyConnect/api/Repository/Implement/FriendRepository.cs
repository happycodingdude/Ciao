using MyConnect.Authentication;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class FriendRepository : BaseRepository<Friend>, IFriendRepository
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FriendRepository(CoreContext context, IHttpContextAccessor httpContextAccessor) : base(context)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Friend GetByTwoContactId(Guid id, Guid fid)
        {
            return _dbSet.FirstOrDefault(q => (q.ContactId1 == id && q.ContactId2 == fid) || (q.ContactId1 == fid && q.ContactId2 == id));
        }

        public override Friend GetById(Guid id)
        {
            var entity = _dbSet.Find(id);
            if (entity == null) return null;

            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var contactId = JwtToken.ExtractToken(token);

            if (entity == null)
                entity = new Friend { Status = "new" };
            else if (entity.Status == "request" && entity.ContactId1 == contactId)
                entity.Status = "request_sent";
            else if (entity.Status == "request" && entity.ContactId2 == contactId)
                entity.Status = "request_received";

            return entity;
        }
    }
}
using MyConnect.Authentication;
using MyConnect.Interface;
using MyConnect.UOW;

namespace MyConnect.Implement
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;

        public UserService(IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
        }

        private Guid ValidateToken()
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            return JwtToken.ExtractToken(token);            
        }

        public void Logout()
        {
            var contactId = ValidateToken();
            var entity = _unitOfWork.Contact.GetById(contactId);
            entity.Logout();
            _unitOfWork.Contact.Update(entity);
            _unitOfWork.Save();
            _notificationService.RemoveConnection(contactId.ToString());
        }
    }
}
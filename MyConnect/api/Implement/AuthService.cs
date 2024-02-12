using MyConnect.Authentication;
using MyConnect.Common;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Implement
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        INotificationService notificationService,
        IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
            _configuration = configuration;
        }

        public void Signup(Contact model)
        {
            // Check username
            var entity = _unitOfWork.Contact.GetAll().FirstOrDefault(q => q.Username == model.Username.Trim());
            if (entity != null)
                throw new Exception(ErrorCode.UserExists);

            model.Password = Hash.Encrypt(model.Password);
            _unitOfWork.Contact.Add(model);
            _unitOfWork.Save();
        }

        public LoginResponse Login(LoginRequest model)
        {
            // Check username
            var entity = _unitOfWork.Contact.GetAll().FirstOrDefault(q => q.Username == model.Username);
            if (entity == null)
                throw new Exception(ErrorCode.NotFound);

            // Check password          
            if (!entity.Password.Equals(Hash.Encrypt(model.Password ?? "")))
                throw new Exception(ErrorCode.WrongPassword);

            entity.Login();
            _unitOfWork.Contact.Update(entity);
            _unitOfWork.Save();

            var response = new LoginResponse
            {
                Token = JwtToken.GenerateToken(_configuration["Jwt:Key"], entity)
            };
            return response;
        }

        public void Logout()
        {
            var contact = ValidateToken();
            contact.Logout();
            _unitOfWork.Contact.Update(contact);
            _unitOfWork.Save();
            _notificationService.RemoveConnection(contact.Id.ToString());
        }

        public Contact ValidateToken()
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            var id = JwtToken.ExtractToken(token);
            return _unitOfWork.Contact.GetById(id);                        
        }

        public void ForgotPassword(ForgotPassword model)
        {
            // Check username
            var entity = _unitOfWork.Contact.GetAll().FirstOrDefault(q => q.Username == model.Username);
            if (entity == null)
                throw new Exception(ErrorCode.NotFound);

            entity.Password = Hash.Encrypt(model.Password);
            _unitOfWork.Contact.Update(entity);
            _unitOfWork.Save();
        }
    }
}
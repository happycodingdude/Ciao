using AutoMapper;
using MyConnect.Authentication;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.Repository;
using MyConnect.UOW;
using MyConnect.Util;

namespace MyConnect.Implement
{
    public class AuthService : BaseService<Contact, ContactDto>, IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationService _notificationService;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;

        public AuthService(IContactRepository repo,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        INotificationService notificationService,
        IMapper mapper,
        IConfiguration configuration) : base(repo, unitOfWork, mapper)
        {
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _notificationService = notificationService;
            _mapper = mapper;
            _configuration = configuration;
        }

        public void Signup(ContactDto model)
        {
            // Check username
            var entity = _unitOfWork.Contact.DbSet.FirstOrDefault(q => q.Username == model.Username.Trim());
            if (entity != null)
                throw new Exception(ErrorCode.UserExists);

            model.EncryptPassword();
            Add(model);
        }

        public LoginResponse Login(LoginRequest model)
        {
            // Check username
            var contact = _unitOfWork.Contact.DbSet.FirstOrDefault(q => q.Username == model.Username);
            if (contact == null)
                throw new Exception(ErrorCode.NotFound);

            // Check password          
            if (!contact.Password.Equals(HashHandler.Encrypt(model.Password ?? "")))
                throw new Exception(ErrorCode.WrongPassword);

            var dto = _mapper.Map<Contact, ContactDto>(contact);
            dto.Login();
            var entity = _mapper.Map<ContactDto, Contact>(dto);
            _unitOfWork.Contact.Update(entity);
            _unitOfWork.Save();

            var response = new LoginResponse
            {
                Token = JwtToken.GenerateToken(_configuration["Jwt:Key"], entity.Id.ToString())
            };
            return response;
        }

        public bool Logout()
        {
            var contact = ExtractTokenAndGetContact();
            contact.Logout();
            Update(contact);
            return _notificationService.RemoveConnection(contact.Id.ToString());
        }

        public ContactDto Validate()
        {
            var contact = ExtractTokenAndGetContact();
            contact.DecryptPassword();
            return contact;
        }

        public void ForgotPassword(ForgotPassword model)
        {
            // Check username
            var entity = _unitOfWork.Contact.DbSet.FirstOrDefault(q => q.Username == model.Username);
            if (entity == null)
                throw new Exception(ErrorCode.NotFound);

            entity.Password = HashHandler.Encrypt(model.Password);
            _unitOfWork.Contact.Update(entity);
            _unitOfWork.Save();
        }

        private ContactDto ExtractTokenAndGetContact()
        {
            // var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            // var id = JwtToken.ExtractToken(token);
            var id = _httpContextAccessor.HttpContext.Session.GetString("UserId");
            return GetById(Guid.Parse(id));
        }
    }
}
using MyConnect.Authentication;
using MyConnect.Common;
using MyConnect.Model;

namespace MyConnect.Repository
{
    public class ContactRepository : BaseRepository<Contact>, IContactRepository
    {
        private readonly CoreContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;

        public ContactRepository(CoreContext context, IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(context)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }

        public Task<LoginResponse> LoginAsync(LoginRequest model)
        {
            // Check username
            var user = _context.Set<Contact>().FirstOrDefault(q => q.Username == model.Username);
            if (user == null)
                throw new Exception(ErrorCode.NotFound);

            // Check password          
            if (!user.Password.Equals(Hash.Encrypt(model.Password)))
                throw new Exception(ErrorCode.WrongPassword);

            var response = new LoginResponse
            {
                Token = JwtToken.GenerateToken(_configuration["Jwt:Key"], user)
            };
            return Task.FromResult(response);
        }

        public object ValidateToken()
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            return JwtToken.ExtractToken(token);
        }
    }
}
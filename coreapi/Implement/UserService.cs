using MyDockerWebAPI.Authentication;
using MyDockerWebAPI.Common;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Implement
{
    public class UserService : BaseRepository<User>, IUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(CoreContext context, IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(context, configuration)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<LoginResponse> Login(LoginRequest model)
        {
            // Check user
            var param = new PagingParam();
            param.Searchs.Add(new Search
            {
                FieldName = nameof(User.Username),
                FieldValue = model.Username
            });
            param.Searchs.Add(new Search
            {
                FieldName = nameof(User.Password),
                FieldValue = Hash.Encrypt(model.Password)
            });

            var user = await GetAll(param);
            if (!user.Any())
                throw new Exception("user not found");

            var response = new LoginResponse
            {
                Token = JwtGenerator.GenerateToken(_configuration["Jwt:Key"], model.Username, model.Password)
            };
            return response;
        }

        public bool CheckToken()
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            return JwtGenerator.CheckTokenExpired(_configuration["Jwt:Key"], token);
        }
    }
}
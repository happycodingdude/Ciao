using MyDockerWebAPI.Authentication;
using MyDockerWebAPI.Common;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Implement
{
    public class UserService : BaseRepository<User>, IUserService
    {
        private const int MaxRetryTime = 5;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(CoreContext context, IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(context, configuration)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest model)
        {
            // Check username
            var param = new PagingParam();
            param.Searchs.Add(new Search
            {
                FieldName = nameof(User.Username),
                FieldValue = model.Username
            });
            var users = await GetAll(param);
            if (!users.Any())
                throw new Exception(ErrorCode.NotFound);

            // Check password
            // If password invalid, update retry time till max value
            var user = users.First();
            if (!user.Password.Equals(Hash.Encrypt(model.Password)))
            {
                user.RetryTime += 1;
                await Update(user);

                var exception = new Exception(ErrorCode.WrongPassword);
                exception.Data["Data"] = new LoginResponse
                {
                    RemainRetry = MaxRetryTime - user.RetryTime
                };
                throw exception;
            }

            // If all valid, reset retry time
            user.RetryTime = 0;
            await Update(user);

            var response = new LoginResponse
            {
                Token = JwtToken.GenerateToken(_configuration["Jwt:Key"], model.Username, model.Password)
            };
            return response;
        }

        public object ValidateToken()
        {
            var token = _httpContextAccessor.HttpContext.Session.GetString("Token");
            return JwtToken.ExtractToken(token);
        }
    }
}
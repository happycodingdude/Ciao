using MyDockerWebAPI.Authentication;
using MyDockerWebAPI.Common;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using MyDockerWebAPI.Repository;

namespace MyDockerWebAPI.Implement
{
    public class UserService : BaseRepository<User>, IUserService
    {
        public UserService(CoreContext context, IConfiguration configuration) : base(context, configuration)
        {

        }

        public async Task<LoginResponse> Login(LoginRequest model)
        {
            // Check user
            var conditions = new List<PagingParam>();
            conditions.Add(new PagingParam
            {
                field_name = nameof(User.Username),
                field_type = typeof(User).GetProperty(nameof(User.Username)).PropertyType,
                field_value = model.Username
            });
            conditions.Add(new PagingParam
            {
                field_name = nameof(User.Password),
                field_type = typeof(User).GetProperty(nameof(User.Password)).PropertyType,
                field_value = Hash.Encrypt(model.Password)
            });

            var user = await GetAll(conditions: conditions);
            if (!user.Any())
                throw new Exception("user not found");

            var response = new LoginResponse
            {
                Token = JwtGenerator.GenerateToken(_configuration["Jwt:Key"], model.Username, model.Password)
            };
            return response;
        }
    }
}
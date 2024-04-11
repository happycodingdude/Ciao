using AutoMapper;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.Repository;
using MyConnect.UOW;
using Newtonsoft.Json;

namespace MyConnect.Implement
{
    public class AuthService : BaseService<Contact, ContactDto>, IAuthService
    {
        public AuthService(IContactRepository repo,
        IUnitOfWork unitOfWork,
        IMapper mapper) : base(repo, unitOfWork, mapper) { }

        public async Task SignupAsync(SignupRequest model)
        {
            // Register to Identity
            using (HttpClient client = new())
            {
                var identityRegister = new ApplicationUser
                {
                    Email = model.Username,
                    Password = model.Password
                };
                var response = await client.PostAsJsonAsync("http://localhost:4100/register", identityRegister);
                response.EnsureSuccessStatusCode();
            }

            // Check username
            // var entity = _unitOfWork.Contact.DbSet.FirstOrDefault(q => q.Username == model.Username.Trim());
            // if (entity != null)
            //     throw new Exception(ErrorCode.UserExists);

            // model.EncryptPassword();
            // Add(model);
        }

        public async Task<LoginResponse> Login(LoginRequest model)
        {
            // // Check username
            // var contact = _unitOfWork.Contact.DbSet.FirstOrDefault(q => q.Username == model.Username);
            // if (contact == null)
            //     throw new Exception(ErrorCode.NotFound);

            // // Check password          
            // if (!contact.Password.Equals(HashHandler.Encrypt(model.Password ?? "")))
            //     throw new Exception(ErrorCode.WrongPassword);

            // Login to Identity
            using (HttpClient client = new())
            {
                var identityRegister = new ApplicationUser
                {
                    Email = model.Username,
                    Password = model.Password
                };
                var response = await client.PostAsJsonAsync("http://localhost:4100/login", identityRegister);
                response.EnsureSuccessStatusCode();
                var context = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<LoginResponse>(context);
            }
        }
    }
}
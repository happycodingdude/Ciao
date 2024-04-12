using AutoMapper;
using Chat.API.Interface;
using Chat.API.Util;
using Chat.API.Model;
using Chat.API.Repository;
using Chat.API.UOW;
using Newtonsoft.Json;

namespace Chat.API.Implement
{
    public class AuthService : BaseService<Contact, ContactDto>, IAuthService
    {
        private readonly IMapper mapper;

        public AuthService(IContactRepository repo,
        IUnitOfWork unitOfWork,
        IMapper mapper) : base(repo, unitOfWork, mapper)
        {
            this.mapper = mapper;
        }

        public async Task SignupAsync(SignupRequest model)
        {
            // Register to Identity
            var request = mapper.Map<SignupRequest, LoginRequest>(model);
            var signUpResponse = await StaticHttpClient.client.PostAsJsonAsync("/api/auth/signup", request);
            signUpResponse.EnsureSuccessStatusCode();

            var content = await signUpResponse.Content.ReadAsStringAsync();
            Guid.TryParse(JsonConvert.DeserializeObject<string>(content), out var userId);
            var create = new ContactDto
            {
                Id = userId,
                Name = model.Name
            };
            Add(create);
        }
    }
}
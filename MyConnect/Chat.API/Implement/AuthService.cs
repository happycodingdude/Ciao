using AutoMapper;
using Chat.API.Interface;
using Chat.API.Util;
using Chat.API.Model;
using Chat.API.Repository;
using Chat.API.UOW;
using Newtonsoft.Json;
using Chat.API.Exceptions;

namespace Chat.API.Implement
{
    public class AuthService : BaseService<Contact, ContactDto>, IAuthService
    {
        public AuthService(IContactRepository repo,
        IUnitOfWork unitOfWork,
        IMapper mapper) : base(repo, unitOfWork, mapper)
        {
        }

        public async Task SignupAsync(SignupRequest model)
        {
            var content = string.Empty;
            // Register to Identity
            var signUpResponse = await StaticHttpClient.client.PostAsJsonAsync("/api/auth/signup", model);
            if (!signUpResponse.IsSuccessStatusCode)
            {
                content = await signUpResponse.Content.ReadAsStringAsync();
                throw new BadRequestException(content);
            }

            content = await signUpResponse.Content.ReadAsStringAsync();
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
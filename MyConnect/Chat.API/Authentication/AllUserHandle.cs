using Chat.API.Exceptions;
using Chat.API.Model;
using Chat.API.Util;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;

namespace Chat.API.Authentication
{
    public class AllUserHandle : AuthorizationHandler<AllUserRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AllUserHandle(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, AllUserRequirement requirement)
        {
            try
            {
                var authorization = _httpContextAccessor.HttpContext.Request.Headers.Authorization;
                var token = authorization.ToString().Split(' ')[1];
                var validatedResponse = await StaticHttpClient.AddToken(token).GetAsync("");
                validatedResponse.EnsureSuccessStatusCode();

                var content = await validatedResponse.Content.ReadAsStringAsync();
                var user = JsonConvert.DeserializeObject<AppUser>(content);
                _httpContextAccessor.HttpContext.Session.SetString("UserId", user.id);

                context.Succeed(requirement);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                throw new UnauthorizedException();
            }
        }
    }
}
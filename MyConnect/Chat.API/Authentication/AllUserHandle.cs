using Chat.API.Exceptions;
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
                var validatedRes = await StaticHttpClient.AddToken(token).GetAsync("");
                validatedRes.EnsureSuccessStatusCode();

                var userId = await validatedRes.Content.ReadAsStringAsync();
                _httpContextAccessor.HttpContext.Session.SetString("UserId", JsonConvert.DeserializeObject<string>(userId));

                context.Succeed(requirement);
            }
            catch
            {
                throw new UnauthorizedException();
            }
        }
    }
}
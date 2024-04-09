using Microsoft.AspNetCore.Authorization;

namespace MyConnect.Authentication
{
    public class TokenAuthorizeHandle : AuthorizationHandler<TokenAuthorizeRequirement>
    {
        private readonly IHttpContextAccessor httpContextAccessor;

        public TokenAuthorizeHandle(IHttpContextAccessor httpContextAccessor)
        {
            this.httpContextAccessor = httpContextAccessor;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, TokenAuthorizeRequirement requirement)
        {
            if (httpContextAccessor.HttpContext.Request.Headers.TryGetValue("Authorization", out var bearer))
            {
                // Extract token from bearer
                var token = bearer.ToString().Split(' ')[1];
                var id = JwtToken.ExtractToken(token);
                httpContextAccessor.HttpContext.Session.SetString("UserId", id.ToString());

                context.Succeed(requirement);
                return Task.CompletedTask;
            }
            return Task.CompletedTask;
        }
    }
}
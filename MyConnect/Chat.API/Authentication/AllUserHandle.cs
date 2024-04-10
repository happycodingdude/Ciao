using Microsoft.AspNetCore.Authorization;

namespace MyConnect.Authentication
{
    public class AllUserHandle : AuthorizationHandler<AllUserRequirement>
    {
        private readonly IHttpContextAccessor httpContextAccessor;

        public AllUserHandle(IHttpContextAccessor httpContextAccessor)
        {
            this.httpContextAccessor = httpContextAccessor;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, AllUserRequirement requirement)
        {
            try
            {
                // Extract token from bearer
                // var bearer = httpContextAccessor.HttpContext.Request.Headers["Authorization"];
                // var token = bearer.ToString().Split(' ')[1];
                // var id = JwtToken.ExtractToken(token);
                // httpContextAccessor.HttpContext.Session.SetString("userId", id.ToString());

                context.Succeed(requirement);

                Console.WriteLine("HandleRequirementAsync try");
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                Console.WriteLine("HandleRequirementAsync catch");
                // context.Fail();
                return Task.CompletedTask;
            }
        }
    }
}
using Microsoft.AspNetCore.Authorization;

namespace MyConnect.Authentication
{
    public class TokenAuthorizeRequirement : IAuthorizationRequirement
    {
        public TokenAuthorizeRequirement(){}
    }
}
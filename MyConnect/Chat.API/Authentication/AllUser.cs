using Microsoft.AspNetCore.Authorization;

namespace Chat.API.Authentication
{
    public class AllUserRequirement : IAuthorizationRequirement
    {
        public AllUserRequirement() { }
    }
}
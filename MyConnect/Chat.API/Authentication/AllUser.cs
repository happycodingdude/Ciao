using Microsoft.AspNetCore.Authorization;

namespace MyConnect.Authentication
{
    public class AllUserRequirement : IAuthorizationRequirement
    {
        public AllUserRequirement() { }
    }
}
using Chat.API.Interface;
using Chat.API.Model;
using Chat.API.Util;

namespace Chat.API.MinimalAPI
{
    public partial class MinimalAPI
    {
        public static void ConfigureAuthAPI(WebApplication app)
        {
            app.MapGroup(Constants.ApiRoute_Auth).MapPost("/signup",
            async (IAuthService authService, SignupRequest model) =>
            {
                await authService.SignupAsync(model);
                return Results.Ok();
            });
        }
    }
}
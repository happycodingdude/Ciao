using System.Security.Claims;
using MyConnect.Interface;
using MyConnect.Model;

namespace Chat.API.MinimalAPI
{
    public partial class MinimalAPI
    {
        // private const string prefix = "/api/auth";

        // public partial void Configure(WebApplication app)
        // {
        //     app.MapGroup("/api/auth");
        //     app.MapPost(prefix + "/signup", async (SignupRequest model, IAuthService authService) =>
        //     {
        //         await authService.SignupAsync(model);
        //         return new ResponseModel1<LoginResponse>().Ok();
        //     });
        //     app.MapPost(prefix + "/login", async (LoginRequest model, IAuthService authService) =>
        //     {
        //         var response = await authService.Login(model);
        //         return new ResponseModel1<LoginResponse>(response).Ok();
        //     });
        // }
    }
}
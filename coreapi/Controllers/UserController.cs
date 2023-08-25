using Microsoft.AspNetCore.Mvc;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Controllers;
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _service;
    private readonly IConfiguration _configuration;

    public UserController(IUserService service, IConfiguration configuration)
    {
        _service = service;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<ActionResult> LoginAsync(LoginRequest model)
    {
        try
        {
            var response = await _service.LoginAsync(model);
            return new ResponseModel<LoginResponse>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<LoginResponse>().BadRequest(ex);
        }
    }

    [HttpGet("authenticate")]
    [MyAuthorizeAttribute("Authorization")]
    public IActionResult CheckToken()
    {
        try
        {
            var response = _service.ValidateToken();
            return new ResponseModel<object>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<object>().BadRequest(ex);
        }
    }
}
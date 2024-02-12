using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IAuthService _authService;

    public AuthController(IConfiguration configuration, IAuthService authService)
    {
        _configuration = configuration;
        _authService = authService;
    }

    [HttpPost("signup")]
    public IActionResult Signup(Contact model)
    {
        try
        {
            _authService.Signup(model);
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }

    [HttpPost("login")]
    public IActionResult Login(LoginRequest model)
    {
        try
        {
            var response = _authService.Login(model);
            return new ResponseModel<LoginResponse>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<LoginResponse>().BadRequest(ex);
        }
    }

    [HttpPost("logout")]
    [MyAuthorizeAttribute("Authorization")]
    public IActionResult Logout()
    {
        try
        {
            _authService.Logout();
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpGet("authenticate")]
    [MyAuthorizeAttribute("Authorization")]
    public IActionResult ValidateToken()
    {
        try
        {
            var response = _authService.ValidateToken();
            response.DecryptPassword();
            return new ResponseModel<Contact>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }

    [HttpPost("forgot")]
    public IActionResult ForgotPassword(ForgotPassword model)
    {
        try
        {
            _authService.ForgotPassword(model);
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }
}
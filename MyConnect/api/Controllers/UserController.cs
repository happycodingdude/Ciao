using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IUserService _userService;

    public UsersController(IConfiguration configuration, IUserService userService)
    {
        _configuration = configuration;
        _userService = userService;
    }

    [HttpPost("signup")]
    public IActionResult Signup(Contact model)
    {
        try
        {
            _userService.Signup(model);
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
            var response = _userService.Login(model);
            return new ResponseModel<LoginResponse>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<LoginResponse>().BadRequest(ex);
        }
    }

    [HttpPost("Logout")]
    [MyAuthorizeAttribute("Authorization")]
    public IActionResult Logout()
    {
        try
        {
            _userService.Logout();
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
            var response = _userService.ValidateToken();
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
            _userService.ForgotPassword(model);
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }
}
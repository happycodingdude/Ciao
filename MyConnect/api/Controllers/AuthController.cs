using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("signup")]
    public IActionResult Signup(ContactDto model)
    {
        try
        {
            _authService.Signup(model);
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ContactDto>().BadRequest(ex);
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
    [MyAuthorize("Authorization")]
    public IActionResult Logout()
    {
        try
        {
            var response = _authService.Logout();
            return new ResponseModel<bool>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<bool>().BadRequest(ex);
        }
    }

    [HttpGet("authenticate")]
    [MyAuthorize("Authorization")]
    public IActionResult ValidateToken()
    {
        try
        {
            var response = _authService.Validate();
            return new ResponseModel<ContactDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ContactDto>().BadRequest(ex);
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
            return new ResponseModel<ContactDto>().BadRequest(ex);
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IUnitOfWork _unitOfWork;

    public UserController(IConfiguration configuration, IUnitOfWork unitOfWork)
    {
        _configuration = configuration;
        _unitOfWork = unitOfWork;
    }

    [HttpPost("login")]
    public IActionResult Login(LoginRequest model)
    {
        try
        {
            var response = _unitOfWork.Contact.Login(model);
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
            _unitOfWork.Contact.Logout();
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
            var response = _unitOfWork.Contact.ValidateToken();
            return new ResponseModel<Contact>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }
}
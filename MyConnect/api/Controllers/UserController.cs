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
    public async Task<IActionResult> LoginAsync(LoginRequest model)
    {
        try
        {
            var response = await _unitOfWork.Contact.LoginAsync(model);
            return new ResponseModel<LoginResponse>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<LoginResponse>().BadRequest(ex);
        }
    }

    [HttpGet("authenticate")]
    [MyAuthorizeAttribute("Authorization")]
    public IActionResult ValidateToken()
    {
        try
        {
            var response = _unitOfWork.Contact.ValidateToken();
            return new ResponseModel<object>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<object>().BadRequest(ex);
        }
    }
}
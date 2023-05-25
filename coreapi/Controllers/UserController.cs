using Microsoft.AspNetCore.Mvc;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using Newtonsoft.Json;

namespace MyDockerWebAPI.Controllers;
[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private static readonly JsonSerializerSettings jsonSetting = new JsonSerializerSettings
    {
        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
    };
    private readonly IUserService _service;
    private readonly IConfiguration _configuration;

    public UserController(IUserService service, IConfiguration configuration)
    {
        _service = service;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync(LoginRequest model)
    {
        try
        {
            var response = await _service.Login(model);
            return new JsonResult(response, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
}
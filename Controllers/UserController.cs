using Microsoft.AspNetCore.Mvc;
using MyDockerWebAPI.Authentication;
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
    private readonly ILibraryService _service;
    private readonly IConfiguration _configuration;

    public UserController(ILibraryService service, IConfiguration configuration)
    {
        _service = service;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public IActionResult Login(LoginRequest model)
    {
        try
        {
            var jwtGenerator = new JwtGenerator(_configuration);
            var response = new LoginResponse
            {
                Token = jwtGenerator.GenerateToken(model.Username, model.Password)
            };
            return new JsonResult(response, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
}
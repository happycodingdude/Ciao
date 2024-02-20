using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpPost("register")]
    public IActionResult RegisterToken(RegisterConnection param)
    {
        try
        {
            var response = _notificationService.RegisterConnection(param);
            return new ResponseModel<bool>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<bool>().BadRequest(ex);
        }
    }
}
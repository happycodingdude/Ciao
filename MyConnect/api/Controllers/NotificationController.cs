using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public IActionResult Get(int page, int limit)
    {
        try
        {
            var response = _notificationService.GetAllNotification(page, limit);
            return new ResponseModel<IEnumerable<NotificationTypeConstraint>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<NotificationTypeConstraint>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _notificationService.GetById(id);
            return new ResponseModel<NotificationDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<NotificationDto>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(NotificationDto model)
    {
        try
        {
            _notificationService.Add(model);
            return new ResponseModel<NotificationDto>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<NotificationDto>().BadRequest(ex);
        }
    }

    [HttpPatch("{id}")]
    public IActionResult Edit(Guid id, JsonPatchDocument patch)
    {
        try
        {
            var response = _notificationService.Patch(id, patch);
            return new ResponseModel<NotificationDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<NotificationDto>().BadRequest(ex);
        }
    }

    [HttpPatch("bulk_edit")]
    public IActionResult BulkEdit(List<PatchRequest<NotificationDto>> patchs)
    {
        try
        {
            var response = _notificationService.BulkUpdate(patchs);
            return new ResponseModel<List<PatchResponse>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<List<PatchResponse>>().BadRequest(ex);
        }
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
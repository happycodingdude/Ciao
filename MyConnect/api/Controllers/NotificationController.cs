using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly IUnitOfWork _unitOfWork;

    public NotificationsController(INotificationService notificationService, IUnitOfWork unitOfWork)
    {
        _notificationService = notificationService;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public IActionResult Get(int page, int limit)
    {
        try
        {
            var response = _notificationService.GetAll(page, limit);
            return new ResponseModel<IEnumerable<NotificationDto>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<NotificationDto>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _unitOfWork.Notification.GetById(id);
            return new ResponseModel<Notification>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Notification>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(Notification model)
    {
        try
        {
            _unitOfWork.Notification.Add(model);
            _unitOfWork.Save();
            return new ResponseModel<Notification>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Notification>().BadRequest(ex);
        }
    }

    [HttpPatch("{id:guid}")]
    public IActionResult Edit(Guid id, JsonPatchDocument patch)
    {
        try
        {
            var entity = _unitOfWork.Notification.GetById(id);
            patch.ApplyTo(entity);
            _unitOfWork.Notification.Update(entity);
            _unitOfWork.Save();
            return new ResponseModel<Notification>(entity).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Notification>().BadRequest(ex);
        }
    }

    [HttpPatch("bulk_edit")]
    public IActionResult BulkEdit(List<PatchRequest<Notification>> patchs)
    {
        try
        {
            var response = new List<PatchResponse>();
            foreach (var patch in patchs)
            {
                var entity = _unitOfWork.Notification.GetById(patch.Id);
                if (entity == null)
                {
                    response.Add(new PatchResponse(entity.Id, "object not found"));
                }
                else
                {
                    patch.PatchDocument.ApplyTo(entity);
                    _unitOfWork.Notification.Update(entity);
                    response.Add(new PatchResponse(entity.Id, "success"));
                }
            }
            _unitOfWork.Save();
            return new ResponseModel<List<PatchResponse>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<List<PatchResponse>>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        try
        {
            _unitOfWork.Notification.Delete(id);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Notification>().BadRequest(ex);
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
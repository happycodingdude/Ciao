using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class FriendsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFriendService _service;

    public FriendsController(IUnitOfWork unitOfWork, IFriendService service)
    {
        _unitOfWork = unitOfWork;
        _service = service;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.Friend.GetAll();
            return new ResponseModel<IEnumerable<Friend>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Friend>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _unitOfWork.Friend.GetById(id);
            return new ResponseModel<Friend>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Friend>().BadRequest(ex);
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddAsync(Friend model, bool includeNotify)
    {
        try
        {
            var response = await _service.AddAndNotify(model, includeNotify);
            return new ResponseModel<Friend>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Friend>().BadRequest(ex);
        }
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify)
    {
        try
        {
            var response = await _service.UpdateAndNotify(id, patch, includeNotify);
            return new ResponseModel<Friend>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Friend>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAsync(Guid id, bool includeNotify)
    {
        try
        {
            await _service.DeleteAndNotify(id, includeNotify);
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Friend>().BadRequest(ex);
        }
    }
}
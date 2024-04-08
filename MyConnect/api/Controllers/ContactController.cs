using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class ContactsController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IFriendService _friendService;

    public ContactsController(IAuthService authService, IFriendService friendService)
    {
        _authService = authService;
        _friendService = friendService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _authService.GetAll();
            return new ResponseModel<IEnumerable<ContactDto>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<ContactDto>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _authService.GetById(id);
            return new ResponseModel<ContactDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ContactDto>().BadRequest(ex);
        }
    }

    [HttpGet("{id}/friends/{friendId}")]
    public IActionResult Get(Guid id, Guid friendId)
    {
        try
        {
            var response = _friendService.GetByTwoContactId(id, friendId);
            return new ResponseModel<FriendDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<FriendDto>().BadRequest(ex);
        }
    }

    [HttpGet("{id}/friends")]
    public IActionResult GetAllFriendByContactId(Guid id)
    {
        try
        {
            var response = _friendService.GetAllFriendByContactId(id);
            return new ResponseModel<IEnumerable<GetAllFriend>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<GetAllFriend>>().BadRequest(ex);
        }
    }

    [HttpPatch("{id}")]
    public IActionResult Edit(Guid id, JsonPatchDocument patch)
    {
        try
        {
            var response = _authService.Patch(id, patch);
            return new ResponseModel<ContactDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ContactDto>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        try
        {
            _authService.Delete(id);
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ContactDto>().BadRequest(ex);
        }
    }
}
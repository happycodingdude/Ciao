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
    private readonly IFriendService _friendService;

    public FriendsController(IFriendService friendService)
    {
        _friendService = friendService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _friendService.GetAll();
            return new ResponseModel<IEnumerable<FriendDto>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<FriendDto>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _friendService.GetById(id);
            return new ResponseModel<FriendDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<FriendDto>().BadRequest(ex);
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddAsync(FriendDto model, bool includeNotify)
    {
        try
        {
            var response = await _friendService.AddAsync(model, includeNotify);
            return new ResponseModel<FriendDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<FriendDto>().BadRequest(ex);
        }
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify)
    {
        try
        {
            var response = await _friendService.UpdateAsync(id, patch, includeNotify);
            return new ResponseModel<FriendDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<FriendDto>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAsync(Guid id, bool includeNotify)
    {
        try
        {
            await _friendService.DeleteAsync(id, includeNotify);
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<FriendDto>().BadRequest(ex);
        }
    }
}
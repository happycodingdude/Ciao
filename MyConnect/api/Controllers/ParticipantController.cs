using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class ParticipantsController : ControllerBase
{
    private readonly IParticipantService _participantService;

    public ParticipantsController(IParticipantService participantService)
    {
        _participantService = participantService;
    }

    [HttpGet("{id}/check/{friendId}")]
    public IActionResult CheckFriend(Guid id, Guid friendId)
    {
        try
        {
            var response = _participantService.CheckExistConversation(id, friendId);
            return new ResponseModel<bool>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<bool>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _participantService.GetById(id);
            return new ResponseModel<ParticipantDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ParticipantDto>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(ParticipantDto model)
    {
        try
        {
            _participantService.Add(model);
            return new ResponseModel<ParticipantDto>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ParticipantDto>().BadRequest(ex);
        }
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify)
    {
        try
        {
            var response = await _participantService.EditAsync(id, patch, includeNotify);
            return new ResponseModel<ParticipantDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ParticipantDto>().BadRequest(ex);
        }
    }
}
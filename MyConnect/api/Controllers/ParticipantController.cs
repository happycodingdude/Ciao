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
    private readonly IUnitOfWork _unitOfWork;
    private readonly IParticipantService _participantService;

    public ParticipantsController(IUnitOfWork unitOfWork, IParticipantService participantService)
    {
        _unitOfWork = unitOfWork;
        _participantService = participantService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.Participant.GetAll();
            return new ResponseModel<IEnumerable<Participant>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Participant>>().BadRequest(ex);
        }
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
            var response = _unitOfWork.Participant.GetById(id);
            return new ResponseModel<Participant>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participant>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(Participant model)
    {
        try
        {
            _unitOfWork.Participant.Add(model);
            _unitOfWork.Save();
            return new ResponseModel<Participant>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participant>().BadRequest(ex);
        }
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> EditAsync(Guid id, JsonPatchDocument patch, bool includeNotify)
    {
        try
        {
            var response = await _participantService.EditParticipantAndNotify(id, patch, includeNotify);
            // var entity = _unitOfWork.Participant.GetById(id);
            // patch.ApplyTo(entity);
            // _unitOfWork.Participant.Update(entity);
            // _unitOfWork.Save();
            return new ResponseModel<Participant>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participant>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        try
        {
            _unitOfWork.Participant.Delete(id);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participant>().BadRequest(ex);
        }
    }
}
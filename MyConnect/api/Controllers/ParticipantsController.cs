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
    private readonly IParticipantsService _participantsService;

    public ParticipantsController(IUnitOfWork unitOfWork, IParticipantsService participantsService)
    {
        _unitOfWork = unitOfWork;
        _participantsService = participantsService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.Participants.GetAll();
            return new ResponseModel<IEnumerable<Participants>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Participants>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _unitOfWork.Participants.GetById(id);
            return new ResponseModel<Participants>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participants>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(Participants model)
    {
        try
        {
            _unitOfWork.Participants.Add(model);
            _unitOfWork.Save();
            return new ResponseModel<Participants>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participants>().BadRequest(ex);
        }
    }

    [HttpPost("{id}/notify")]
    public async Task<IActionResult> Notify(Guid id)
    {
        try
        {
            await _participantsService.NotifyMessage(id);
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPut]
    public IActionResult Edit(Participants model)
    {
        try
        {
            _unitOfWork.Participants.Update(model);
            _unitOfWork.Save();
            return new ResponseModel<Participants>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participants>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        try
        {
            _unitOfWork.Participants.Delete(id);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participants>().BadRequest(ex);
        }
    }
}
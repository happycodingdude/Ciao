using Microsoft.AspNetCore.Mvc;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
// [MyAuthorize("Authorization")]
public class ParticipantsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ParticipantsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
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
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participants>().BadRequest(ex);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Edit(Participants model)
    {
        try
        {
            _unitOfWork.Participants.Update(model);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participants>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
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
using Microsoft.AspNetCore.Mvc;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
// [MyAuthorize("Authorization")]
public class ScheduleContactsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ScheduleContactsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.ScheduleContact.GetAll();
            return new ResponseModel<IEnumerable<ScheduleContact>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<ScheduleContact>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _unitOfWork.ScheduleContact.GetById(id);
            return new ResponseModel<ScheduleContact>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleContact>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(ScheduleContact model)
    {
        try
        {
            _unitOfWork.ScheduleContact.Add(model);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleContact>().BadRequest(ex);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Edit(ScheduleContact model)
    {
        try
        {
            _unitOfWork.ScheduleContact.Update(model);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleContact>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            _unitOfWork.ScheduleContact.Delete(id);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleContact>().BadRequest(ex);
        }
    }
}
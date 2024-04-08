using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class ScheduleContactsController : ControllerBase
{
    private readonly IScheduleContactService _scheduleContactService;

    public ScheduleContactsController(IScheduleContactService scheduleContactService)
    {
        _scheduleContactService = scheduleContactService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _scheduleContactService.GetAll();
            return new ResponseModel<IEnumerable<ScheduleContactDto>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<ScheduleContactDto>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _scheduleContactService.GetById(id);
            return new ResponseModel<ScheduleContactDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleContactDto>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(ScheduleContactDto model)
    {
        try
        {
            _scheduleContactService.Add(model);
            return new ResponseModel<ScheduleContactDto>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleContactDto>().BadRequest(ex);
        }
    }

    [HttpPut]
    public IActionResult Edit(ScheduleContactDto model)
    {
        try
        {
            _scheduleContactService.Update(model);
            return new ResponseModel<ScheduleContactDto>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleContactDto>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        try
        {
            _scheduleContactService.Delete(id);
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleContactDto>().BadRequest(ex);
        }
    }
}
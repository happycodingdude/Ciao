using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class SchedulesController : ControllerBase
{
    private readonly IScheduleService _scheduleService;

    public SchedulesController(IScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _scheduleService.GetAll();
            return new ResponseModel<IEnumerable<ScheduleDto>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<ScheduleDto>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _scheduleService.GetById(id);
            return new ResponseModel<ScheduleDto>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleDto>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(ScheduleDto model)
    {
        try
        {
            _scheduleService.Add(model);
            return new ResponseModel<ScheduleDto>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleDto>().BadRequest(ex);
        }
    }

    [HttpPut]
    public IActionResult Edit(ScheduleDto model)
    {
        try
        {
            _scheduleService.Update(model);
            return new ResponseModel<ScheduleDto>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleDto>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        try
        {
            _scheduleService.Delete(id);
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<ScheduleDto>().BadRequest(ex);
        }
    }
}
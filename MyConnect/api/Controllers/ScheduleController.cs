using Microsoft.AspNetCore.Mvc;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class SchedulesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public SchedulesController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.Schedule.GetAll();
            return new ResponseModel<IEnumerable<Schedule>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Schedule>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _unitOfWork.Schedule.GetById(id);
            return new ResponseModel<Schedule>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Schedule>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(Schedule model)
    {
        try
        {
            _unitOfWork.Schedule.Add(model);
            _unitOfWork.Save();
            return new ResponseModel<Schedule>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Schedule>().BadRequest(ex);
        }
    }

    [HttpPut]
    public IActionResult Edit(Schedule model)
    {
        try
        {
            _unitOfWork.Schedule.Update(model);
            _unitOfWork.Save();
            return new ResponseModel<Schedule>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Schedule>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        try
        {
            _unitOfWork.Schedule.Delete(id);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Schedule>().BadRequest(ex);
        }
    }
}
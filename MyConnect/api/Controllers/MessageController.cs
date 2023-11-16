using Microsoft.AspNetCore.Mvc;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class MessagesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public MessagesController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.Message.GetAll();
            return new ResponseModel<IEnumerable<Message>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Message>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _unitOfWork.Message.GetById(id);
            return new ResponseModel<Message>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Message>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(Message model)
    {
        try
        {
            _unitOfWork.Message.Add(model);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Message>().BadRequest(ex);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Edit(Message model)
    {
        try
        {
            _unitOfWork.Message.Update(model);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Message>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            _unitOfWork.Message.Delete(id);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Message>().BadRequest(ex);
        }
    }
}
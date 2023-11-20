using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class MessagesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMessageService _messageService;

    public MessagesController(IUnitOfWork unitOfWork, IMessageService messageService)
    {
        _unitOfWork = unitOfWork;
        _messageService = messageService;
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
            return new ResponseModel<Message>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Message>().BadRequest(ex);
        }
    }

    [HttpPut]
    public IActionResult Edit(Message model)
    {
        try
        {
            _unitOfWork.Message.Update(model);
            _unitOfWork.Save();
            return new ResponseModel<Message>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Message>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
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

    [HttpPost("send")]
    public IActionResult SaveAndNotifyMessage(Message model)
    {
        try
        {
            _messageService.SaveAndNotifyMessage(model);
            return new ResponseModel<Message>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Message>().BadRequest(ex);
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class ConversationsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ConversationsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.Conversation.GetAll().OrderByDescending(q => q.CreatedTime);
            return new ResponseModel<IEnumerable<Conversation>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Conversation>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _unitOfWork.Conversation.GetById(id);
            return new ResponseModel<Conversation>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Conversation>().BadRequest(ex);
        }
    }

    [HttpGet("{id}/participants")]
    public IActionResult GetParticipants(Guid id)
    {
        try
        {
            var response = _unitOfWork.Participants.GetByConversationIdIncludeContact(id);
            return new ResponseModel<IEnumerable<Participants>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participants>().BadRequest(ex);
        }
    }

    [HttpGet("{id}/messages")]
    public IActionResult GetMessages(Guid id)
    {
        try
        {
            var response = _unitOfWork.Message.GetByConversationId(id);
            return new ResponseModel<IEnumerable<Message>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Message>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}/details")]
    public IActionResult GetChatDetails(Guid id)
    {
        try
        {
            var response = _unitOfWork.Conversation.GetByIdIncludeDetails(id);
            return new ResponseModel<Conversation>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Conversation>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(Conversation model)
    {
        try
        {
            _unitOfWork.Conversation.Add(model);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Conversation>().BadRequest(ex);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Edit(Conversation model)
    {
        try
        {
            _unitOfWork.Conversation.Update(model);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Conversation>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            _unitOfWork.Conversation.Delete(id);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Conversation>().BadRequest(ex);
        }
    }
}
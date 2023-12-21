using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class ConversationsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IParticipantsService _participantsService;

    public ConversationsController(IUnitOfWork unitOfWork, IParticipantsService participantsService)
    {
        _unitOfWork = unitOfWork;
        _participantsService = participantsService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.Conversation.GetAllWithUnseenMesages();
            return new ResponseModel<IEnumerable<ConversationWithTotalUnseen>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<ConversationWithTotalUnseen>>().BadRequest(ex);
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

    [HttpPost("{id}/participants")]
    public async Task<IActionResult> AddParticipants(List<Participants> model)
    {
        try
        {
            var response = await _participantsService.AddParticipantAndNotify(model);
            return new ResponseModel<List<Participants>>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<List<Participants>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}/messages")]
    public IActionResult GetMessages(Guid id)
    {
        try
        {
            var response = _unitOfWork.Message.GetByConversationId(id);
            return new ResponseModel<IEnumerable<MessageGroupByCreatedTime>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<MessageGroupByCreatedTime>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}/attachments")]
    public IActionResult GetAttachments(Guid id)
    {
        try
        {
            var response = _unitOfWork.Attachment.GetByConversationId(id);
            return new ResponseModel<IEnumerable<Model.AttachmentGroupByCreatedTime>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Model.AttachmentGroupByCreatedTime>>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(Conversation model)
    {
        try
        {
            _unitOfWork.Conversation.Add(model);
            _unitOfWork.Save();
            return new ResponseModel<Conversation>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Conversation>().BadRequest(ex);
        }
    }

    [HttpPut]
    public IActionResult Edit(Conversation model)
    {
        try
        {
            _unitOfWork.Conversation.Update(model);
            _unitOfWork.Save();
            return new ResponseModel<Conversation>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Conversation>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
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
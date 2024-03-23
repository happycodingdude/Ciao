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
    private readonly IParticipantService _participantService;
    private readonly IConversationService _conversationService;

    public ConversationsController(IUnitOfWork unitOfWork, IParticipantService participantService, IConversationService conversationService)
    {
        _unitOfWork = unitOfWork;
        _participantService = participantService;
        _conversationService = conversationService;
    }

    [HttpGet]
    public IActionResult Get(int page, int limit)
    {
        try
        {
            var response = _unitOfWork.Conversation.GetAllWithUnseenMesages(page, limit);
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
    public IActionResult GetParticipant(Guid id)
    {
        try
        {
            var response = _unitOfWork.Participant.GetByConversationIdIncludeContact(id);
            return new ResponseModel<IEnumerable<Participant>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participant>().BadRequest(ex);
        }
    }

    [HttpPost("{id}/participants")]
    public async Task<IActionResult> AddParticipant(Guid id, List<Participant> model)
    {
        try
        {
            var response = await _participantService.AddParticipantAndNotify(id, model);
            return new ResponseModel<List<Participant>>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<List<Participant>>().BadRequest(ex);
        }
    }

    [HttpPut("{id}/participants")]
    public async Task<IActionResult> EditParticipant(Participant model)
    {
        try
        {
            var response = await _participantService.EditParticipantAndNotify(model);
            return new ResponseModel<Participant>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participant>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}/participants")]
    public async Task<IActionResult> RemoveChat(Participant model)
    {
        try
        {
            var response = await _participantService.RemoveChatAndNotify(model);
            return new ResponseModel<Participant>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participant>().BadRequest(ex);
        }
    }

    [HttpGet("{id}/messages")]
    public IActionResult GetMessages(Guid id, int page, int limit)
    {
        try
        {
            var response = _unitOfWork.Message.GetWithPaging(id, page, limit);
            return new ResponseModel<IEnumerable<MessageNoReference>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<MessageNoReference>>().BadRequest(ex);
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
    public async Task<IActionResult> CreateConversation(Conversation model)
    {
        try
        {
            var response = await _conversationService.CreateConversationAndNotify(model);
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

    [HttpPut("{id}/avatars")]
    public IActionResult Edit(Guid id, Conversation model)
    {
        try
        {
            var entity = _unitOfWork.Conversation.GetById(id);
            entity.Avatar = model.Avatar;
            _unitOfWork.Conversation.Update(entity);
            _unitOfWork.Save();
            return new ResponseModel<Conversation>(entity).Ok();
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
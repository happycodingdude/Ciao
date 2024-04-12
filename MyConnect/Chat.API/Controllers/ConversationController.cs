using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Chat.API.Interface;
using Chat.API.Model;
using Chat.API.UOW;

namespace Chat.API.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class ConversationsController : ControllerBase
{
    // private readonly IConversationService _conversationService;
    // private readonly IParticipantService _participantService;
    // private readonly IMessageService _messageService;
    // private readonly IAttachmentService _attachmentService;

    // public ConversationsController(IConversationService conversationService,
    // IParticipantService participantService,
    // IMessageService messageService,
    // IAttachmentService attachmentService)
    // {
    //     _conversationService = conversationService;
    //     _participantService = participantService;
    //     _messageService = messageService;
    //     _attachmentService = attachmentService;
    // }

    // [HttpGet]
    // public IActionResult Get(int page, int limit)
    // {
    //     try
    //     {
    //         var response = _conversationService.GetAllWithUnseenMesages(page, limit);
    //         return new ResponseModel<IEnumerable<ConversationWithTotalUnseen>>(response).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         return new ResponseModel<IEnumerable<ConversationWithTotalUnseen>>().BadRequest(ex);
    //     }
    // }

    // [HttpGet("{id}")]
    // public IActionResult Get(Guid id)
    // {
    //     try
    //     {
    //         var response = _conversationService.GetById(id);
    //         return new ResponseModel<ConversationDto>(response).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         return new ResponseModel<ConversationDto>().BadRequest(ex);
    //     }
    // }

    // [HttpGet("{id}/participants")]
    // public IActionResult GetParticipant(Guid id)
    // {
    //     try
    //     {
    //         var response = _participantService.GetByConversationIdIncludeContact(id);
    //         return new ResponseModel<IEnumerable<ParticipantDto>>(response).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         return new ResponseModel<ParticipantDto>().BadRequest(ex);
    //     }
    // }

    // [HttpPost("{id}/participants")]
    // public async Task<IActionResult> AddParticipantAsync(Guid id, List<ParticipantDto> model, bool includeNotify)
    // {
    //     try
    //     {
    //         var response = await _participantService.AddAsync(id, model, includeNotify);
    //         return new ResponseModel<List<ParticipantDto>>(model).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         return new ResponseModel<List<ParticipantDto>>().BadRequest(ex);
    //     }
    // }

    // [HttpGet("{id}/messages")]
    // public IActionResult GetMessages(Guid id, int page, int limit)
    // {
    //     try
    //     {
    //         var response = _messageService.GetByConversationIdWithPaging(id, page, limit);
    //         return new ResponseModel<IEnumerable<MessageNoReference>>(response).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         return new ResponseModel<IEnumerable<MessageNoReference>>().BadRequest(ex);
    //     }
    // }

    // [HttpGet("{id}/attachments")]
    // public IActionResult GetAttachments(Guid id)
    // {
    //     try
    //     {
    //         var response = _attachmentService.GetByConversationId(id);
    //         return new ResponseModel<IEnumerable<AttachmentGroupByCreatedTime>>(response).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         return new ResponseModel<IEnumerable<AttachmentGroupByCreatedTime>>().BadRequest(ex);
    //     }
    // }

    // [HttpPost]
    // public async Task<IActionResult> CreateAsync(ConversationDto model, bool includeNotify)
    // {
    //     try
    //     {
    //         var response = await _conversationService.CreateAsync(model, includeNotify);
    //         return new ResponseModel<ConversationDto>(model).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         return new ResponseModel<ConversationDto>().BadRequest(ex);
    //     }
    // }

    // [HttpPatch("{id}")]
    // public IActionResult Edit(Guid id, JsonPatchDocument patch)
    // {
    //     try
    //     {
    //         var response = _conversationService.Patch(id, patch);
    //         return new ResponseModel<ConversationDto>(response).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         return new ResponseModel<ConversationDto>().BadRequest(ex);
    //     }
    // }
}
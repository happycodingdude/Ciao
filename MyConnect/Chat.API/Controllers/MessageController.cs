using Microsoft.AspNetCore.Mvc;
using Chat.API.Interface;
using Chat.API.Model;
using Chat.API.UOW;

namespace Chat.API.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class MessagesController : ControllerBase
{
    // private readonly IMessageService _messageService;

    // public MessagesController(IMessageService messageService)
    // {
    //     _messageService = messageService;
    // }

    // [HttpGet("{id}")]
    // public IActionResult Get(Guid id)
    // {
    //     try
    //     {
    //         var response = _messageService.GetById(id);
    //         return new ResponseModel<MessageDto>(response).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         return new ResponseModel<MessageDto>().BadRequest(ex);
    //     }
    // }

    // [HttpPost]
    // public IActionResult Add(MessageDto model)
    // {
    //     try
    //     {
    //         _messageService.Add(model);
    //         return new ResponseModel<MessageDto>(model).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         return new ResponseModel<MessageDto>().BadRequest(ex);
    //     }
    // }

    // [HttpPut]
    // public IActionResult Edit(MessageDto model)
    // {
    //     try
    //     {
    //         _messageService.Update(model);
    //         return new ResponseModel<MessageDto>(model).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         return new ResponseModel<MessageDto>().BadRequest(ex);
    //     }
    // }

    // [HttpPost("send")]
    // public async Task<IActionResult> SaveAndNotifyMessage(MessageDto model)
    // {
    //     try
    //     {
    //         var response = await _messageService.SaveAndNotifyMessage(model);
    //         return new ResponseModel<MessageDto>(response).Ok();
    //     }
    //     catch (Exception ex)
    //     {
    //         Console.WriteLine(ex);
    //         return new ResponseModel<MessageDto>().BadRequest(ex);
    //     }
    // }
}
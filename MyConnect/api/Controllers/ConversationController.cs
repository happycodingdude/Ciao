using Microsoft.AspNetCore.Mvc;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
// [MyAuthorize("Authorization")]
public class ConversationController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ConversationController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.Conversation.GetAll();
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
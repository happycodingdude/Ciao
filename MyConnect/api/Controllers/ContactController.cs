using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class ContactsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFriendService _friendService;

    public ContactsController(IUnitOfWork unitOfWork, IFriendService friendService)
    {
        _unitOfWork = unitOfWork;
        _friendService = friendService;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.Contact.GetAll();
            return new ResponseModel<IEnumerable<Contact>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Contact>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _unitOfWork.Contact.GetById(id);
            return new ResponseModel<Contact>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }

    [HttpGet("{id}/friends/{friendId}")]
    public IActionResult Get(Guid id, Guid friendId)
    {
        try
        {
            var response = _friendService.GetByTwoContactId(id, friendId);
            return new ResponseModel<Friend>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Friend>().BadRequest(ex);
        }
    }

    [HttpGet("{id}/friends")]
    public IActionResult GetAllFriendByContactId(Guid id)
    {
        try
        {
            var response = _friendService.GetAllFriendByContactId(id);
            return new ResponseModel<IEnumerable<GetAllFriend>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<GetAllFriend>>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(Contact model)
    {
        try
        {
            model.EncryptPassword();
            _unitOfWork.Contact.Add(model);
            _unitOfWork.Save();
            return new ResponseModel<Contact>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }

    [HttpPatch("{id}")]
    public IActionResult Edit(Guid id, JsonPatchDocument patch)
    {
        try
        {
            var entity = _unitOfWork.Contact.GetById(id);
            patch.ApplyTo(entity);
            // entity.EncryptPassword();
            _unitOfWork.Contact.Update(entity);
            _unitOfWork.Save();
            return new ResponseModel<Contact>(entity).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        try
        {
            _unitOfWork.Contact.Delete(id);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }
}
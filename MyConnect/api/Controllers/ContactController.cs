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
    private readonly IContactService _contactService;

    public ContactsController(IUnitOfWork unitOfWork, IContactService contactService)
    {
        _unitOfWork = unitOfWork;
        _contactService = contactService;
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

    [HttpGet("{id}/friends/{fid}")]
    public IActionResult Get(Guid id, Guid fid)
    {
        try
        {
            var response = _unitOfWork.Friend.GetAll().FirstOrDefault(q => q.ContactId2 == fid);
            return new ResponseModel<Friend>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Friend>().BadRequest(ex);
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

    [HttpPut]
    public IActionResult Edit(Contact model)
    {
        try
        {
            model.EncryptPassword();
            _unitOfWork.Contact.Update(model);
            _unitOfWork.Save();
            return new ResponseModel<Contact>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Contact>().BadRequest(ex);
        }
    }

    [HttpPut("{id}/avatars")]
    public IActionResult Edit(Guid id, Contact model)
    {
        try
        {
            var entity = _unitOfWork.Contact.GetById(id);
            entity.Avatar = model.Avatar;
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
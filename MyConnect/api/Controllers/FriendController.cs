using Microsoft.AspNetCore.Mvc;
using MyConnect.Interface;
using MyConnect.Model;
using MyConnect.UOW;

namespace MyConnect.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class FriendsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFriendService _service;

    public FriendsController(IUnitOfWork unitOfWork, IFriendService service)
    {
        _unitOfWork = unitOfWork;
        _service = service;
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            var response = _unitOfWork.Friend.GetAll();
            return new ResponseModel<IEnumerable<Friend>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<IEnumerable<Friend>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public IActionResult Get(Guid id)
    {
        try
        {
            var response = _unitOfWork.Friend.GetById(id);
            return new ResponseModel<Friend>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Friend>().BadRequest(ex);
        }
    }

    [HttpPost]
    public IActionResult Add(Friend model, bool includeNotify)
    {
        try
        {
            _service.AddAndNotify(model, includeNotify);
            return new ResponseModel<Friend>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Friend>().BadRequest(ex);
        }
    }

    [HttpPut]
    public IActionResult Edit(Friend model)
    {
        try
        {
            _unitOfWork.Friend.Update(model);
            _unitOfWork.Save();
            return new ResponseModel<Friend>(model).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Friend>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        try
        {
            _unitOfWork.Friend.Delete(id);
            _unitOfWork.Save();
            return Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Friend>().BadRequest(ex);
        }
    }
}
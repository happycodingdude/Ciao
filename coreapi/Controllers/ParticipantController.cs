using Microsoft.AspNetCore.Mvc;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class ParticipantController : ControllerBase
{
    private readonly IParticipantService _service;
    private readonly IConfiguration _configuration;

    public ParticipantController(IParticipantService service, IConfiguration configuration)
    {
        _service = service;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var response = await _service.GetAll();
            return new ResponseModel<List<Participant>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<List<Participant>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        try
        {
            var response = await _service.GetById(id);
            return new ResponseModel<Participant>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participant>().BadRequest(ex);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Add(Participant model)
    {
        try
        {
            var data = await _service.Add(model);
            return new ResponseModel<Participant>(data).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participant>().BadRequest(ex);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Edit(Participant model)
    {
        try
        {
            var current = await _service.GetById(model.Id);
            model.BeforeUpdate(current);
            var data = await _service.Update(model);
            return new ResponseModel<Participant>(data).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Participant>().BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var response = await _service.Delete(id);
            return new ResponseModel<object>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<object>().BadRequest(ex);
        }
    }
}
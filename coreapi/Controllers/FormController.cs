using Microsoft.AspNetCore.Mvc;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class FormController : ControllerBase
{
    private readonly IFormService _service;
    private readonly IConfiguration _configuration;

    public FormController(IFormService service, IConfiguration configuration)
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
            return new ResponseModel<List<Form>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<List<Form>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        try
        {
            var response = await _service.GetById(id);
            return new ResponseModel<Form>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Form>().BadRequest(ex);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Add(Form model)
    {
        try
        {
            var data = await _service.Add(model);
            return new ResponseModel<Form>(data).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Form>().BadRequest(ex);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Edit(Form model)
    {
        try
        {
            var current = await _service.GetById(model.Id);
            model.BeforeUpdate(current);
            var data = await _service.Update(model);
            return new ResponseModel<Form>(data).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Form>().BadRequest(ex);
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
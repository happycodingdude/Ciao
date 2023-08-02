using Microsoft.AspNetCore.Mvc;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;

namespace MyDockerWebAPI.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class LocationController : ControllerBase
{
    private readonly ILocationService _service;
    private readonly IConfiguration _configuration;

    public LocationController(ILocationService service, IConfiguration configuration)
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
            return new ResponseModel<List<Location>>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<List<Location>>().BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        try
        {
            var response = await _service.GetById(id);
            return new ResponseModel<Location>(response).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Location>().BadRequest(ex);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Add(Location model)
    {
        try
        {
            var data = await _service.Add(model);
            return new ResponseModel<Location>(data).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Location>().BadRequest(ex);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Edit(Location model)
    {
        try
        {
            var current = await _service.GetById(model.Id);
            model.BeforeUpdate(current);
            var data = await _service.Update(model);
            return new ResponseModel<Location>(data).Ok();
        }
        catch (Exception ex)
        {
            return new ResponseModel<Location>().BadRequest(ex);
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
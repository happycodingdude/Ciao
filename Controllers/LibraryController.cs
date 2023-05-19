using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using mydockercoreapi.Common;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using Newtonsoft.Json;

namespace MyDockerWebAPI.Controllers;
[ApiController]
[Route("[controller]")]
[Authorize(Roles = UserRole.Admin)]
public class LibraryController : ControllerBase
{
    private static readonly JsonSerializerSettings jsonSetting = new JsonSerializerSettings
    {
        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
    };
    private readonly ILibraryService _service;
    private readonly IConfiguration _configuration;

    public LibraryController(ILibraryService service, IConfiguration configuration)
    {
        _service = service;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var data = await _service.GetAll(new string[] { nameof(Category), nameof(Publisher) });
            return new JsonResult(data, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        try
        {
            var data = await _service.GetById(id, new string[] { nameof(Category), nameof(Publisher) });
            return new JsonResult(data, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Add(Book model)
    {
        try
        {
            var data = await _service.Add(model);
            return new JsonResult(data, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Edit(Book model)
    {
        try
        {
            var current = await _service.GetById(model.Id);
            model.BeforeUpdate(current);
            var data = await _service.Update(model);
            return new JsonResult(data, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _service.Delete(id);
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
}
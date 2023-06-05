using Microsoft.AspNetCore.Mvc;
using MyDockerWebAPI.Common;
using MyDockerWebAPI.Interface;
using MyDockerWebAPI.Model;
using MyDockerWebAPI.RestApi;
using Newtonsoft.Json;

namespace MyDockerWebAPI.Controllers;
[ApiController]
[Route("api/[controller]")]
[MyAuthorize("Authorization")]
public class SubmissionController : ControllerBase
{
    private static readonly JsonSerializerSettings jsonSetting = new JsonSerializerSettings
    {
        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
    };
    private readonly ISubmissionService _service;
    private readonly IConfiguration _configuration;

    public SubmissionController(ISubmissionService service, IConfiguration configuration)
    {
        _service = service;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var data = await _service.GetAll(new string[] { nameof(Form), nameof(Participant), nameof(Location) });
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
            var data = await _service.GetById(id, new string[] { nameof(Form), nameof(Participant), nameof(Location) });
            return new JsonResult(data, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Add(Submission model)
    {
        try
        {
            model.Status = SubmissionStatus.Draft;
            var data = await _service.Add(model);
            return new JsonResult(data, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Edit(Submission model)
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

    [HttpPost("{id}/submit")]
    public async Task<IActionResult> Submit(int id)
    {
        try
        {
            var current = await _service.GetById(id, new string[] { nameof(Form), nameof(Participant), nameof(Location) });
            current.Status = SubmissionStatus.Confirm;
            current.BeforeUpdate(current);
            var data = await _service.Update(current);

            var message = string.Join(" - ",
                new string[] {
                    current.Form.Name,
                    current.Participant.Name,
                    current.Location.Name,
                    current.FromTime.ToString(),
                    current.ToTime.ToString()
                }
            );
            _ = TelegramFunction.SendMessage(message);

            return new JsonResult(data, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
}
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
    private readonly IServiceProvider _serviceProvider;

    public SubmissionController(ISubmissionService service, IConfiguration configuration, IServiceProvider serviceProvider)
    {
        _service = service;
        _configuration = configuration;
        _serviceProvider = serviceProvider;
    }

    [HttpPost("search")]
    public async Task<IActionResult> Get(PagingParam? param)
    {
        try
        {
            var data = await _service.GetAll(param);
            return new JsonResult(data, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id, PagingParam param)
    {
        try
        {
            var data = await _service.GetById(id, param);
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
            await _service.Add(model);
            var param = new PagingParam();
            var data = await _service.GetById(model.Id, param);
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
            var current = await _service.GetById(id);
            current.Status = SubmissionStatus.Confirm;
            current.BeforeUpdate(current);
            var data = await _service.Update(current);

            var message = string.Join("\n",
                new string[] {
                    current.Form.Name,
                    current.Participant.Name,
                    current.Location.Name,
                    current.FromTime.Value.ToString("d/M/yyyy HH:mm"),
                    current.ToTime.Value.ToString("d/M/yyyy HH:mm")
                }
            );

            var telegramFunction = _serviceProvider.GetService<TelegramFunction>();
            _ = telegramFunction.SendButtonMessage(message, id);

            return new JsonResult(data, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
}
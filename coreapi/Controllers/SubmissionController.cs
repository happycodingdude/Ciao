using AutoMapper;
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
    private readonly IMapper _mapper;

    public SubmissionController(ISubmissionService service, IConfiguration configuration, IServiceProvider serviceProvider, IMapper mapper)
    {
        _service = service;
        _configuration = configuration;
        _serviceProvider = serviceProvider;
        _mapper = mapper;
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

    [HttpPost("{id}")]
    public async Task<IActionResult> Get(int id, PagingParam? param)
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
    public async Task<IActionResult> Add(SubmissionToAdd model)
    {
        try
        {
            model.Status = SubmissionStatus.Draft;
            var entity = _mapper.Map<Submission>(model);
            await _service.Add(entity);
            var param = new PagingParam
            {
                Includes = new List<Include>
                {
                    new Include{TableName = nameof(Form)},
                    new Include{TableName = nameof(Participant)},
                    new Include{TableName = nameof(Location)}
                },
                Sorts = new List<Sort>
                {
                    new Sort
                    {
                        FieldName = nameof(Submission.CreateTime),
                        SortType = "desc"
                    }
                }
            };
            var data = await _service.GetById(entity.Id, param);
            return new JsonResult(data, jsonSetting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPut]
    public async Task<IActionResult> Edit(SubmissionToAdd model)
    {
        try
        {
            var current = await _service.GetById(model.Id);
            model.BeforeUpdate(current);
            var entity = _mapper.Map<Submission>(model);
            await _service.Update(entity);
            var param = new PagingParam
            {
                Includes = new List<Include>
                {
                    new Include{TableName = nameof(Form)},
                    new Include{TableName = nameof(Participant)},
                    new Include{TableName = nameof(Location)}
                },
                Sorts = new List<Sort>
                {
                    new Sort
                    {
                        FieldName = nameof(Submission.CreateTime),
                        SortType = "desc"
                    }
                }
            };
            var data = await _service.GetById(model.Id, param);
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
            var param = new PagingParam
            {
                Includes = new List<Include>
                {
                    new Include{TableName = nameof(Form)},
                    new Include{TableName = nameof(Participant)},
                    new Include{TableName = nameof(Location)}
                }
            };
            var current = await _service.GetById(id, param);
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
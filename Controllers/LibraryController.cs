using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyDockerWebAPI.Repository;
using Newtonsoft.Json;

namespace MyDockerWebAPI.Controllers;
[ApiController]
[Route("[controller]")]
public class LibraryController : ControllerBase
{
    private readonly LibraryContext _context;
    private readonly JsonSerializerSettings jsonSetting = new JsonSerializerSettings
    {
        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
    };

    public LibraryController(LibraryContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var data = await _context.Books.AsNoTracking()
                .Include(q => q.Publisher)
                .Include(q => q.Category)
                .ToListAsync();
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
            var data = await _context.Books.AsNoTracking()
                .Include(q => q.Publisher)
                .Include(q => q.Category)
                .FirstOrDefaultAsync(q => q.Id.Equals(id));
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
            _context.Books.Add(model);
            await _context.SaveChangesAsync();
            return new JsonResult(model, jsonSetting);
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
            var current = _context.Books
                .Include(q => q.Publisher)
                .Include(q => q.Category)
                .FirstOrDefault(q => q.Id.Equals(model.Id));
            if (current != null)
            {
                _context.Entry<Book>(current).CurrentValues.SetValues(model);
                await _context.SaveChangesAsync();
            }
            return new JsonResult(current, jsonSetting);
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
            var current = _context.Books.FirstOrDefault(q => q.Id.Equals(id));
            if (current != null)
            {
                _context.Books.Remove(current);
                await _context.SaveChangesAsync();
            }
            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
}
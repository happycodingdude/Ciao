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

    public LibraryController(LibraryContext context)
    {
        _context = context;
    }

    [HttpGet(Name = "GetData")]
    public IActionResult GetAll()
    {
        try
        {
            var data = _context.Book.AsNoTracking().Include(p => p.Publisher).ToList();
            var setting = new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            };
            return new JsonResult(data, setting);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
}
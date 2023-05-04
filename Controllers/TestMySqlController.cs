using System.Linq;
using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using MyDockerWebAPI.Repository;

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

    // [HttpGet(Name = "GetData")]
    // public object GetAll()
    // {
    //     try
    //     {
    //         var data = _context.TestTables.FirstOrDefault();
    //         return data;
    //     }
    //     catch
    //     {
    //         return new TestModel();
    //     }
    // }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;

namespace MyDockerWebAPI
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // configure services and dependencies here
        }
        public void Configure(IApplicationBuilder app)
        {
            Console.WriteLine("Startup calls");
        }
    }
}
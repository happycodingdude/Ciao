using System.Security.Claims;
using System.Text;
using Authentication.API.Context;
using Authentication.API.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var configuration = new ConfigurationBuilder()
            .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddXmlFile("appsettings.xml", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .AddCommandLine(args)
            .Build();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Authentication
// builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme)
// .AddJwtBearer(options =>
//             {
//                 options.TokenValidationParameters = new TokenValidationParameters
//                 {
//                     ValidIssuer = configuration["Jwt:Issuer"],
//                     ValidAudience = configuration["Jwt:Issuer"],
//                     IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(configuration["Jwt:Key"])),
//                     ValidateIssuer = true,
//                     ValidateAudience = true,
//                     ValidateLifetime = true,
//                     ValidateIssuerSigningKey = true,
//                 };
//             });
builder.Services.AddAuthentication()
            // .AddCookie(IdentityConstants.ApplicationScheme)
            .AddBearerToken(IdentityConstants.BearerScheme);
// Add Authorization
builder.Services.AddAuthorizationBuilder();
// Config Dbcontext
builder.Services.AddDbContext<AppDbContext>(x => x.UseMySQL(configuration.GetConnectionString("Db-Development")));
builder.Services
// .AddIdentityApiEndpoints<AppUser>()
.AddIdentityCore<AppUser>()
.AddEntityFrameworkStores<AppDbContext>()
.AddApiEndpoints();

var app = builder.Build();

// app.UseAuthorization();
app.MapIdentityApi<AppUser>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/", (ClaimsPrincipal user) => $"Hello {user.Identity.Name}")
.RequireAuthorization();

// app.MapPost("/logout", async (HttpContext context) =>
// {
//     await context.SignOutAsync(IdentityConstants.BearerScheme);
//     return Results.Ok();
// }).RequireAuthorization();
app.MapPost("/logout", async (SignInManager<AppUser> manager) =>
{
    await manager.SignOutAsync().ConfigureAwait(false);
    return Results.Ok();
}).RequireAuthorization();

app.Run();

using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var configuration = new ConfigurationBuilder()
            .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddXmlFile("appsettings.xml", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .AddCommandLine(args)
            .Build();

// Add common service
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Authentication
builder.Services.AddAuthentication()
.AddBearerToken(IdentityConstants.BearerScheme);
// Add Authorization
builder.Services.AddAuthorization();
// Config Dbcontext
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseMySQL(configuration.GetConnectionString("Db-Development")));
builder.Services.AddIdentityCore<AppUser>()
.AddEntityFrameworkStores<AppDbContext>()
// .AddClaimsPrincipalFactory<AppClaimsFactory>()
.AddApiEndpoints();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapGroup("/api/auth").MapIdentityApi<AppUser>();

app.MapGet("/", async (UserManager<AppUser> userManager, ClaimsPrincipal model) =>
{
    return await userManager.GetUserAsync(model);
})
.RequireAuthorization();
app.MapGroup("/api/auth").MapPost("/signup", async (UserManager<AppUser> userManager, SignupRequest model) =>
{
    var user = new AppUser
    {
        // Email = model.Username,
        UserName = model.Username,
        PasswordHash = model.Password
    };
    var result = await userManager.CreateAsync(user, user.PasswordHash);
    if (result.Succeeded)
    {
        var created = await userManager.GetUserIdAsync(user);
        return Results.Ok(created);
    }
    return Results.BadRequest(result);
});

app.Run();

class AppUser : IdentityUser { }
class AppDbContext : IdentityDbContext<AppUser> { public AppDbContext(DbContextOptions options) : base(options) { } }
// class AppClaimsFactory : IUserClaimsPrincipalFactory<AppUser>
// {
//     public Task<ClaimsPrincipal> CreateAsync(AppUser user)
//     {
//         var claims = new Claim[] {
//             new Claim("UserId", user.Id),
//         };
//         var claimsIdentity = new ClaimsIdentity(claims, "Bearer");
//         var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
//         return Task.FromResult(claimsPrincipal);
//     }
// }

class SignupRequest
{
    public string Name { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
}
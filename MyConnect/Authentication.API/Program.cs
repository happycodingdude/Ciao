using System.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;

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

// Add HttpClient
builder.Services.AddHttpClient("Chat", client =>
{
    client.BaseAddress = new Uri("http://localhost:4000");
});

// Scopes
builder.Services.AddScoped((_) => new SqlConnectionProvider(configuration.GetConnectionString("Db-Development")));

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
app.UseDbTransaction();

app.MapGroup("/api/auth").MapIdentityApi<AppUser>();

app.MapGet("/", async (UserManager<AppUser> userManager, ClaimsPrincipal model) =>
{
    return await userManager.GetUserAsync(model);
}).RequireAuthorization();

app.MapGroup("/api/auth").MapPost("/signup",
async (UserManager<AppUser> userManager, SignupRequest model, IHttpClientFactory clientFactory) =>
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
        var contact = new CreateContact
        {
            Id = created,
            Name = model.Name
        };
        var client = clientFactory.CreateClient("Chat");
        Console.WriteLine(client.BaseAddress);
        var response = await client.PostAsJsonAsync("/api/contactss", contact);
        response.EnsureSuccessStatusCode();
        return Results.Ok();
    }
    return Results.BadRequest(result);
});

app.Run();

class AppUser : IdentityUser { }
class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions options) : base(options) { }
}
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

class CreateContact
{
    public string Id { get; set; }
    public string Name { get; set; }
}

public class DbTransactionMiddleware
{
    private readonly RequestDelegate _next;

    public DbTransactionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext httpContext, SqlConnectionProvider connectionProvider)
    {
        Console.WriteLine("DbTransactionMiddleware calling");
        // For HTTP GET opening transaction is not required
        if (httpContext.Request.Method.Equals("GET", StringComparison.CurrentCultureIgnoreCase))
        {
            await _next(httpContext);
            return;
        }

        IDbTransaction transaction = null;

        try
        {
            transaction = connectionProvider.CreateTransaction();

            await _next(httpContext);

            Console.WriteLine("transaction Commit");
            transaction.Rollback();
        }
        finally
        {
            Console.WriteLine("transaction Dispose");
            transaction?.Dispose();
        }
    }
}

public class SqlConnectionProvider
{
    private readonly IDbConnection _connection;
    private IDbTransaction _transaction;

    public SqlConnectionProvider(string connectionString)
    {
        _connection = new MySqlConnection(connectionString);
    }

    public IDbConnection GetDbConnection => _connection;

    public IDbTransaction GetTransaction => _transaction;

    public IDbTransaction CreateTransaction()
    {
        if (_connection.State == ConnectionState.Closed)
            _connection.Open();

        _transaction = _connection.BeginTransaction();

        return _transaction;
    }
}
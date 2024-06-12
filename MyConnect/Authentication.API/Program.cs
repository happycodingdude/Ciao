
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

// builder.Services.AddSingleton<IAuthorizationHandler, TokenHandler>();
// builder.Services.AddAuthorization(opt =>
// {
//     opt.AddPolicy("token", policy =>
//     {
//         policy.AddRequirements(new TokenRequirement());
//     });
// });

// builder.Services.AddSession(options =>
// {
//     options.Cookie.Name = "my-session";
//     // options.IdleTimeout = TimeSpan.FromSeconds(10);
//     // options.Cookie.IsEssential = true;
// });
// builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
// {
//     options.Cookie.HttpOnly = true;
//     options.Cookie.Name = "5m-token";
//     options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
//     options.SlidingExpiration = true;
//     // options.AccessDeniedPath = "/Forbidden/";
// });
// builder.Services.AddAuthentication().AddCookie(IdentityConstants.ApplicationScheme, opt =>
// {
//     opt.Cookie.Name = "app-token";
//     opt.Cookie.HttpOnly = true;
//     opt.ExpireTimeSpan = TimeSpan.FromMinutes(1);
// });

// Add Authorization
builder.Services.AddAuthorization();

// Config Dbcontext
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseMySQL(configuration.GetConnectionString("Db-Development")));
builder.Services.AddIdentityCore<AppUser>()
.AddEntityFrameworkStores<AppDbContext>()
// .AddClaimsPrincipalFactory<AppClaimsFactory>()
.AddApiEndpoints();

// Add HttpClient
builder.Services.AddHttpClient(Constants.HttpClient_Chat, client =>
{
    client.BaseAddress = new Uri(Constants.ApiDomain_Chat);
});

var app = builder.Build();

// Using from Domain project        
Utils.RedisCLient.Configure(configuration);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // app.UseExceptionHandler();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseDbTransaction();

app.MapGroup(Constants.ApiRoute_User).MapIdentityApi<AppUser>();

app.MapGroup(Constants.ApiRoute_User).MapPost(Constants.ApiEndpoint_SignUp,
// async Task<Results<Ok, BadRequest<IdentityResult>>>
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
        var client = clientFactory.CreateClient(Constants.HttpClient_Chat);
        var response = await client.PostAsJsonAsync(Constants.ApiRoute_Contact, contact);
        response.EnsureSuccessStatusCode();
        return Results.Ok();
    }
    return Results.BadRequest(result);
});
// .WithOpenApi(operation => new(operation)
// {
//     OperationId = "SignUp",
//     Tags = new List<OpenApiTag> { new() { Name = "Authen" } },
//     Description = "signup description",
//     Summary = "signup summary",
//     Deprecated = true
// })
// .Produces(StatusCodes.Status200OK)
// .Produces(StatusCodes.Status404NotFound);

app.MapGroup(Constants.ApiRoute_User).MapPost(Constants.ApiEndpoint_SignIn,
async (SignInManager<AppUser> manager, SignupRequest model, HttpContext context) =>
{
    Stream originalBodyStream = context.Response.Body;
    using (var ms = new MemoryStream())
    {
        context.Response.Body = ms;

        manager.AuthenticationScheme = IdentityConstants.BearerScheme;
        await manager.PasswordSignInAsync(model.Username, model.Password, false, lockoutOnFailure: false);

        ms.Seek(0, SeekOrigin.Begin);
        var responseBody = new StreamReader(ms).ReadToEnd();
        if (string.IsNullOrEmpty(responseBody))
        {
            Console.WriteLine("Unauthorized");
            return Results.Unauthorized();
        }

        var responseModel = JsonConvert.DeserializeObject<SignInResponse>(responseBody);
        context.Response.Headers.Append("access_token", responseModel.accessToken);
        context.Response.Headers.Append("refresh_token", responseModel.refreshToken);

        // ms.Seek(0, SeekOrigin.Begin);
        // await ms.CopyToAsync(originalBodyStream);

        // Another way
        // context.Response.Body = originalBodyStream;
        // await context.Response.Body.WriteAsync(ms.ToArray());
    }

    return Results.Empty;
});

app.MapGroup(Constants.ApiRoute_User).MapGet(Constants.ApiEndpoint_Token,
async (UserManager<AppUser> userManager, ClaimsPrincipal model) =>
{
    var user = await userManager.FindByNameAsync(model.Identity.Name);
    return Results.Ok(user);
}).RequireAuthorization();

app.MapGroup(Constants.ApiRoute_User).MapGet(Constants.ApiEndpoint_Signout,
async (UserManager<AppUser> userManager, ClaimsPrincipal model, HttpContext context) =>
{
    // Delete all cookies
    foreach (var cookie in context.Request.Cookies.Keys)
        context.Response.Cookies.Delete(cookie);

    // Delete Firebase connection
    var user = await userManager.FindByNameAsync(model.Identity.Name);
    Utils.RedisCLient.Db.KeyDelete($"connection-{user.Id}");

    return Results.Ok();
}).RequireAuthorization();

app.Run();


// class AppClaimsFactory : IUserClaimsPrincipalFactory<AppUser>
// {
//     public Task<ClaimsPrincipal> CreateAsync(AppUser user)
//     {
//         var claims = new Claim[] {
//             new Claim("UserId", user.Id),
//             new Claim(ClaimTypes.Name, user.UserName),
//         };
//         var claimsIdentity = new ClaimsIdentity(claims, "Bearer");
//         var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);
//         return Task.FromResult(claimsPrincipal);
//     }
// }




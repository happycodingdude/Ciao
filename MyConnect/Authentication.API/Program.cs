
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
// builder.Services.AddAuthentication().AddCookie(IdentityAppConstants.ApplicationScheme, opt =>
// {
//     opt.Cookie.Name = "app-token";
//     opt.Cookie.HttpOnly = true;
//     opt.ExpireTimeSpan = TimeSpan.FromMinutes(1);
// });

// Add Authorization
builder.Services.AddAuthorization();

// Config Dbcontext
builder.Services.AddDbContext<AuthenticationDbContext>(opt => opt.UseMySQL(configuration.GetConnectionString("Db-Development")));
builder.Services.AddIdentityCore<AuthenticationUser>()
.AddEntityFrameworkStores<AuthenticationDbContext>()
// .AddClaimsPrincipalFactory<AppClaimsFactory>()
.AddApiEndpoints();

// Add HttpClient
builder.Services.AddHttpClient(AppConstants.HttpClient_Chat, client =>
{
    client.BaseAddress = new Uri(AppConstants.ApiDomain_Chat);
});

// Exception handler
builder.Services.AddExceptionHandler<BadRequestExceptionHandler>();
builder.Services.AddExceptionHandler<UnauthorizedExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

// Config Redis        
Utils.RedisCLient.Configure(configuration);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseExceptionHandler();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseAuthenticationDbTransaction();

app.MapGroup(AppConstants.ApiRoute_User).MapIdentityApi<AuthenticationUser>();

app.MapGroup(AppConstants.ApiRoute_User).MapPost(AppConstants.ApiEndpoint_SignUp,
// async Task<Results<Ok, BadRequest<IdentityResult>>>
async (UserManager<AuthenticationUser> userManager, SignupRequest model, IHttpClientFactory clientFactory) =>
{
    var user = new AuthenticationUser
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
        var client = clientFactory.CreateClient(AppConstants.HttpClient_Chat);
        var response = await client.PostAsJsonAsync(AppConstants.ApiRoute_Contact, contact);
        try
        {
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new BadRequestException(error);
        }
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

app.MapGroup(AppConstants.ApiRoute_User).MapPost("/signin",
async (SignInManager<AuthenticationUser> manager, SignupRequest model, HttpContext context) =>
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

app.MapGroup(AppConstants.ApiRoute_User).MapGet("/token",
async (UserManager<AuthenticationUser> userManager, ClaimsPrincipal model) =>
{
    var user = await userManager.FindByNameAsync(model.Identity.Name);
    return Results.Ok(user);
}).RequireAuthorization();

app.MapGroup(AppConstants.ApiRoute_User).MapGet("/signout",
async (UserManager<AuthenticationUser> userManager, ClaimsPrincipal model, HttpContext context) =>
{
    // Delete all cookies
    foreach (var cookie in context.Request.Cookies.Keys)
        context.Response.Cookies.Delete(cookie);

    // Delete Firebase connection
    var user = await userManager.FindByNameAsync(model.Identity.Name);
    Utils.RedisCLient.Db.KeyDelete($"connection-{user.Id}");

    return Results.Ok();
}).RequireAuthorization();

app.MapGroup(AppConstants.ApiRoute_User).MapPost("/forgot",
async (UserManager<AuthenticationUser> userManager, SignupRequest model) =>
{
    var user = await userManager.FindByNameAsync(model.Username);
    var token = await userManager.GeneratePasswordResetTokenAsync(user);
    var result = await userManager.ResetPasswordAsync(user, token, model.Password);
    return Results.Ok(user);
});

app.Run();


// class AppClaimsFactory : IUserClaimsPrincipalFactory<AuthenticationUser>
// {
//     public Task<ClaimsPrincipal> CreateAsync(AuthenticationUser user)
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




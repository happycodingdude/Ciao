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
builder.Services.AddHttpClient(Constants.HttpClient_Chat, client =>
{
    client.BaseAddress = new Uri(Constants.ApiDomain_Chat);
});

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

// Using from Domain project
// Common.RedisCLient.Configure(configuration);

app.MapGroup(Constants.ApiRoute_Auth).MapIdentityApi<AppUser>();

app.MapGroup(Constants.ApiRoute_Auth).MapPost(Constants.ApiEndpoint_SignUp,
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

app.MapGroup(Constants.ApiRoute_Auth).MapGet(Constants.ApiEndpoint_Token,
// async Task<Results<Ok<AppUser>, ProblemHttpResult>>
async (UserManager<AppUser> userManager, ClaimsPrincipal model) =>
{
    Console.WriteLine(model.Identity.Name);
    var user = await userManager.FindByNameAsync(model.Identity.Name);
    return Results.Ok(user);
}).RequireAuthorization();

// app.MapGroup("/api/auth").MapPost("/signin",
// // Task<Results<SignIn<SignInHttpResult>, ProblemHttpResult>>
// async (SignInManager<AppUser> signInManager, SignupRequest model, HttpContext context) =>
// {
//     // signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
//     // var result = await signInManager.PasswordSignInAsync(model.Username, model.Password, isPersistent: false, lockoutOnFailure: true);
//     // if (!result.Succeeded)
//     //     return Results.Problem(result.ToString(), statusCode: StatusCodes.Status401Unauthorized);
//     // Console.WriteLine(result.Succeeded);
//     // return Results.Empty;
//     var claimsPrincipal = new ClaimsPrincipal(
//           new ClaimsIdentity(
//             new[] { new Claim(ClaimTypes.Name, model.Username) },
//             BearerTokenDefaults.AuthenticationScheme  //👈
//           )
//         );
//     // var signinResult = Results.SignIn(claimsPrincipal);
//     await context.SignInAsync(claimsPrincipal);
//     // var context = new DefaultHttpContext
//     // {
//     //     // RequestServices = new ServiceCollection().AddLogging().BuildServiceProvider(),
//     //     Response =
//     //     {
//     //         // The default response body is Stream.Null which throws away anything that is written to it.
//     //         Body = new MemoryStream(),
//     //     },
//     // };
//     context.Response.Body = new MemoryStream();
//     Console.WriteLine(context.Response.Body.Length);
//     // await signinResult.ExecuteAsync(context);
//     // // Reset MemoryStream to start so we can read the response.
//     context.Response.Body.Position = 0;
//     var body = await new StreamReader(context.Response.Body).ReadToEndAsync();
//     Console.WriteLine(body);
//     // _ = context.Response.WriteAsJsonAsync(new SignupRequest { });
//     // return Results.Extensions.HtmlResponse("Hello world");
//     return Results.Empty;
// });

app.Run();


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

// static class CustomResultExtensions
// {
//     public static IResult HtmlResponse(this IResultExtensions extensions, string html)
//     {
//         return new CustomHTMLResult(html);
//     }
// }
// class CustomHTMLResult : IResult
// {
//     private readonly string _content;
//     public CustomHTMLResult(string content)
//     {
//         _content = content;
//     }
//     public async Task ExecuteAsync(HttpContext httpContext)
//     {
//         httpContext.Response.ContentType = "application/octet-stream";
//         httpContext.Response.ContentLength = Encoding.UTF8.GetByteCount(_content);
//         await httpContext.Response.WriteAsync(_content);
//     }
// }




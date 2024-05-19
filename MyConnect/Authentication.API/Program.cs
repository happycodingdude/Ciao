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
RedisCLient.Configure(configuration);

app.MapGroup("/api/auth").MapIdentityApi<AppUser>();

app.MapGroup("/api/auth").MapGet("/token",
async Task<Results<Ok<AppUser>, ProblemHttpResult>>
(UserManager<AppUser> userManager, ClaimsPrincipal model) =>
{
    var user = await userManager.GetUserAsync(model);
    return TypedResults.Ok(user);
}).RequireAuthorization();

app.MapGroup("/api/auth").MapPost("/signup",
async Task<Results<Ok, BadRequest<IdentityResult>>>
(UserManager<AppUser> userManager, SignupRequest model, IHttpClientFactory clientFactory) =>
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
        var response = await client.PostAsJsonAsync("/api/contacts", contact);
        response.EnsureSuccessStatusCode();
        return TypedResults.Ok();
    }
    return TypedResults.BadRequest(result);
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

app.MapGroup("/api/auth").MapPost("/signin",
async Task<Results<Ok<SignInResult>, EmptyHttpResult, ProblemHttpResult>>
(SignInManager<AppUser> signInManager, SignupRequest model) =>
{
    signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
    var result = await signInManager.PasswordSignInAsync(model.Username, model.Password, isPersistent: false, lockoutOnFailure: true);
    if (!result.Succeeded)
        return TypedResults.Problem(result.ToString(), statusCode: StatusCodes.Status401Unauthorized);
    Console.WriteLine(result.Succeeded);
    return TypedResults.Empty;
});

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




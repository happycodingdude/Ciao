var builder = WebApplication.CreateBuilder(args);

Console.WriteLine($"appsettings.{builder.Environment.EnvironmentName}.json");

var configuration = new ConfigurationBuilder()
            .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
            .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
            // .AddXmlFile("appsettings.xml", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables()
            .AddCommandLine(args)
            .Build();

builder.Services.InstallServices(builder.Configuration, builder.Environment, typeof(IServiceInstaller).Assembly);

var app = builder.Build();
// app.UseCookiePolicy(new CookiePolicyOptions
// {
//     MinimumSameSitePolicy = SameSiteMode.Strict,
// });

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseSession();
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// app.UseCheckSignout();
// app.UseInitDatabase();
// app.MapGroup("/identity").MapIdentityApi<AuthenticationUser>();

app.UseDbTransaction();
// app.UseAuthenticationDbTransaction();
app.MapCarter();

app.Run();
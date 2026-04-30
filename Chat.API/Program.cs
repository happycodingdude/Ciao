DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.InstallServices(builder.Configuration, builder.Environment, typeof(IServiceInstaller).Assembly);
builder.Host.AddSerilog();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseSession();
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors();
// app.MapHub<SignalHub>("/ciaohub");
app.UseAuthentication();
app.UseAuthorization();

app.UseDbTransaction();
app.MapCarter();

Console.WriteLine("App is running...");

app.Run();
// var builder = WebApplication.CreateBuilder(args);

// // Add services to the container.
// // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// var app = builder.Build();

// // Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

// app.UseHttpsRedirection();

// app.MapGroup(Constants.ApiRoute_Notification).MapGet("/",
//         (INotificationService notificationService, int page, int limit) =>
//         {
//             var response = notificationService.GetAllNotification(page, limit);
//             return Results.Ok(response);
//         }).RequireAuthorization("AllUser");

// app.MapGroup(Constants.ApiRoute_Notification).MapGet("/{id}",
// (INotificationService notificationService, Guid id) =>
// {
//     var response = notificationService.GetById(id);
//     return Results.Ok(response);
// }).RequireAuthorization("AllUser");

// app.MapGroup(Constants.ApiRoute_Notification).MapPatch("/{id}",
// async (INotificationService notificationService, Guid id, JsonElement jsonElement) =>
// {
//     var json = jsonElement.GetRawText();
//     Console.WriteLine("json: " + json);
//     var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
//     var response = await notificationService.PatchAsync(id, patch);
//     return Results.Ok(response);
// }).RequireAuthorization("AllUser");

// app.MapGroup(Constants.ApiRoute_Notification).MapPatch("/bulk_edit",
// async (INotificationService notificationService, JsonElement jsonElement) =>
// {
//     var json = jsonElement.GetRawText();
//     var patch = JsonConvert.DeserializeObject<List<PatchRequest<NotificationDto>>>(json);
//     var response = await notificationService.BulkUpdateAsync(patch);
//     return Results.Ok(response);
// }).RequireAuthorization("AllUser");

// app.MapGroup(Constants.ApiRoute_Notification).MapPost("/register",
// (INotificationService notificationService, RegisterConnection param) =>
// {
//     var response = notificationService.RegisterConnection(param);
//     return Results.Ok(response);
// }).RequireAuthorization("AllUser");

// app.Run();

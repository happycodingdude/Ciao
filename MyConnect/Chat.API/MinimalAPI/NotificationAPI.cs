using System.Text.Json;
using Newtonsoft.Json;

namespace Chat.API.MinimalAPI;

public partial class MinimalAPI
{
    public static void ConfigureNotificationAPI(WebApplication app)
    {
        app.MapGroup(Constants.ApiRoute_Notification).MapGet("/",
        (INotificationService notificationService, int page, int limit) =>
        {
            var response = notificationService.GetAllNotification(page, limit);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Notification).MapGet("/{id}",
        (INotificationService notificationService, Guid id) =>
        {
            var response = notificationService.GetById(id);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Notification).MapPatch("/{id}",
        (INotificationService notificationService, Guid id, JsonElement jsonElement) =>
        {
            var json = jsonElement.GetRawText();
            Console.WriteLine("json: " + json);
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var response = notificationService.Patch(id, patch);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Notification).MapPatch("/bulk_edit",
        (INotificationService notificationService, JsonElement jsonElement) =>
        {
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<List<PatchRequest<NotificationDto>>>(json);
            var response = notificationService.BulkUpdate(patch);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Notification).MapPost("/register",
        (INotificationService notificationService, RegisterConnection param) =>
        {
            var response = notificationService.RegisterConnection(param);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");
    }
}
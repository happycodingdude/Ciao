using Chat.API.Interface;
using Chat.API.Model;
using Chat.API.Util;
using Microsoft.AspNetCore.JsonPatch;

namespace Chat.API.MinimalAPI
{
    public partial class MinimalAPI
    {
        public static void ConfigureNotificationAPI(WebApplication app)
        {
            app.MapGroup(Constants.ApiRoute_Notification).MapGet("/",
            (INotificationService notificationService, int page, int limit) =>
            {
                var response = notificationService.GetAllNotification(page, limit);
                return Results.Ok(new ResponseModel<IEnumerable<NotificationTypeConstraint>>(response));
            }).RequireAuthorization("AllUser");

            app.MapGroup(Constants.ApiRoute_Notification).MapGet("/{id}",
            (INotificationService notificationService, Guid id) =>
            {
                var response = notificationService.GetById(id);
                return Results.Ok(new ResponseModel<NotificationDto>(response));
            }).RequireAuthorization("AllUser");

            app.MapGroup(Constants.ApiRoute_Notification).MapPatch("/{id}",
            (INotificationService notificationService, Guid id, JsonPatchDocument patch) =>
            {
                var response = notificationService.Patch(id, patch);
                return Results.Ok(new ResponseModel<NotificationDto>(response));
            }).RequireAuthorization("AllUser");

            app.MapGroup(Constants.ApiRoute_Notification).MapPatch("/bulk_edit",
            (INotificationService notificationService, List<PatchRequest<NotificationDto>> patchs) =>
            {
                var response = notificationService.BulkUpdate(patchs);
                return Results.Ok(new ResponseModel<List<PatchResponse>>(response));
            }).RequireAuthorization("AllUser");

            app.MapGroup(Constants.ApiRoute_Notification).MapPost("/register",
            (INotificationService notificationService, RegisterConnection param) =>
            {
                var response = notificationService.RegisterConnection(param);
                return Results.Ok(new ResponseModel<bool>(response));
            }).RequireAuthorization("AllUser");
        }
    }
}
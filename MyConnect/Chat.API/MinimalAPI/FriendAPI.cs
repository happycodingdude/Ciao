using Chat.API.Interface;
using Chat.API.Model;
using Chat.API.Util;
using Microsoft.AspNetCore.JsonPatch;

namespace Chat.API.MinimalAPI
{
    public partial class MinimalAPI
    {
        public static void ConfigureFriendAPI(WebApplication app)
        {
            app.MapGroup(Constants.ApiRoute_Friend).MapGet("/{id}",
             (IFriendService friendService, Guid id) =>
            {
                var response = friendService.GetById(id);
                return Results.Ok(new ResponseModel<FriendDto>(response));
            }).RequireAuthorization("AllUser");

            app.MapGroup(Constants.ApiRoute_Friend).MapPost("/",
            async (IFriendService friendService, FriendDto model, bool includeNotify) =>
            {
                var response = await friendService.AddAsync(model, includeNotify);
                return Results.Ok(new ResponseModel<FriendDto>(response));
            }).RequireAuthorization("AllUser");

            app.MapGroup(Constants.ApiRoute_Friend).MapPatch("/{id}",
            async (IFriendService friendService, Guid id, JsonPatchDocument patch, bool includeNotify) =>
            {
                var response = await friendService.UpdateAsync(id, patch, includeNotify);
                return Results.Ok(new ResponseModel<FriendDto>(response));
            }).RequireAuthorization("AllUser");

            app.MapGroup(Constants.ApiRoute_Friend).MapDelete("/{id}",
            async (IFriendService friendService, Guid id, bool includeNotify) =>
            {
                await friendService.DeleteAsync(id, includeNotify);
                return Results.Ok();
            }).RequireAuthorization("AllUser");
        }
    }
}
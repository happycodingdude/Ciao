using Chat.API.Interface;
using Chat.API.Model;
using Chat.API.Util;
using Microsoft.AspNetCore.JsonPatch;

namespace Chat.API.MinimalAPI
{
    public partial class MinimalAPI
    {
        public static void ConfigureContactAPI(WebApplication app)
        {
            app.MapGroup(Constants.ApiRoute_Contact).MapGet("/{id}",
            (IAuthService authService, Guid id) =>
            {
                var response = authService.GetById(id);
                return Results.Ok(new ResponseModel<ContactDto>(response));
            }).RequireAuthorization("AllUser");

            app.MapGroup(Constants.ApiRoute_Contact).MapGet("/{id}/friends/{friendId}",
            (IFriendService friendService, Guid id, Guid friendId) =>
            {
                var response = friendService.GetByTwoContactId(id, friendId);
                return Results.Ok(new ResponseModel<FriendDto>(response));
            }).RequireAuthorization("AllUser");

            app.MapGroup(Constants.ApiRoute_Contact).MapGet("/{id}/friends",
            (IFriendService friendService, Guid id) =>
            {
                var response = friendService.GetAllFriendByContactId(id);
                return Results.Ok(new ResponseModel<IEnumerable<GetAllFriend>>(response));
            }).RequireAuthorization("AllUser");

            app.MapGroup(Constants.ApiRoute_Contact).MapPatch("/{id}",
            (IAuthService authService, Guid id, JsonPatchDocument patch) =>
            {
                var response = authService.Patch(id, patch);
                return Results.Ok(new ResponseModel<ContactDto>(response));
            }).RequireAuthorization("AllUser");
        }
    }
}
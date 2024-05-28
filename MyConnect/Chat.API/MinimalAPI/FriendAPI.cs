using System.Text.Json;

namespace Chat.API.MinimalAPI;

public partial class MinimalAPI
{
    public static void ConfigureFriendAPI(WebApplication app)
    {
        app.MapGroup(Constants.ApiRoute_Friend).MapGet("/{id}",
         (IFriendService friendService, Guid id) =>
        {
            var response = friendService.GetById(id);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Friend).MapPost("/",
        async (IFriendService friendService, FriendDto model, bool includeNotify) =>
        {
            var response = await friendService.AddAsync(model, includeNotify);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Friend).MapPatch("/{id}",
        async (IFriendService friendService, Guid id, JsonElement jsonElement, bool includeNotify) =>
        {
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var response = await friendService.UpdateAsync(id, patch, includeNotify);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Friend).MapDelete("/{id}",
        async (IFriendService friendService, Guid id, bool includeNotify) =>
        {
            await friendService.DeleteAsync(id, includeNotify);
            return Results.Ok();
        }).RequireAuthorization("AllUser");
    }
}
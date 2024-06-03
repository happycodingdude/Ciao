using System.Text.Json;
using Newtonsoft.Json;

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
        async (IFriendService friendService, FriendDto model, [FromQuery] bool includeNotify = false) =>
        {
            var response = await friendService.AddAsync(model, includeNotify);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Friend).MapPatch("/{id}",
        async (IFriendService friendService, Guid id, JsonElement jsonElement, [FromQuery] bool includeNotify = false) =>
        {
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var response = await friendService.UpdateAsync(id, patch, includeNotify);
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Friend).MapDelete("/{id}",
        async (IFriendService friendService, Guid id, [FromQuery] bool includeNotify = false) =>
        {
            await friendService.DeleteAsync(id, includeNotify);
            return Results.Ok();
        }).RequireAuthorization("AllUser");
    }
}
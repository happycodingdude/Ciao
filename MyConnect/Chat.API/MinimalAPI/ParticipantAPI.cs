namespace Chat.API.MinimalAPI;

public partial class MinimalAPI
{
    public static void ConfigureParticipantAPI(WebApplication app)
    {
        app.MapGroup(Constants.ApiRoute_Participant).MapGet("/{id}/check/{friendId}",
        (IParticipantService participantService, Guid id, Guid friendId) =>
        {
            var response = participantService.CheckExistConversation(id, friendId);
            return Results.Ok(new ResponseModel<bool>(response));
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Participant).MapGet("/{id}",
        (IParticipantService participantService, Guid id) =>
        {
            var response = participantService.GetById(id);
            return Results.Ok(new ResponseModel<ParticipantDto>(response));
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Participant).MapPatch("/{id}",
        async (IParticipantService participantService, Guid id, JsonPatchDocument patch, bool includeNotify) =>
        {
            var response = await participantService.EditAsync(id, patch, includeNotify);
            return Results.Ok(new ResponseModel<ParticipantDto>(response));
        }).RequireAuthorization("AllUser");
    }
}
namespace Chat.API.MinimalAPI;

public partial class MinimalAPI
{
    public static void ConfigureMessageAPI(WebApplication app)
    {
        app.MapGroup(Constants.ApiRoute_Message).MapGet("/{id}",
        (IMessageService messageService, Guid id) =>
        {
            var response = messageService.GetById(id);
            return Results.Ok(new ResponseModel<MessageDto>(response));
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Message).MapPost("/send",
        async (IMessageService messageService, MessageDto model) =>
        {
            var response = await messageService.SaveAndNotifyMessage(model);
            return Results.Ok(new ResponseModel<MessageDto>(response));
        }).RequireAuthorization("AllUser");
    }
}
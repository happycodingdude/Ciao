namespace Chat.API.MinimalAPI;

public partial class MinimalAPI
{
    public static void ConfigureConversationAPI(WebApplication app)
    {
        app.MapGroup(Constants.ApiRoute_Conversation).MapGet("/",
        (IConversationService conversationService, int page, int limit) =>
        {
            var response = conversationService.GetAllWithUnseenMesages(page, limit);
            // return Results.Ok(new ResponseModel<IEnumerable<ConversationWithTotalUnseen>>(response));
            return Results.Ok(response);
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Conversation).MapGet("/{id}", (IConversationService conversationService, Guid id) =>
        {
            var response = conversationService.GetById(id);
            return Results.Ok(new ResponseModel<ConversationDto>(response));
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Conversation).MapGet("/{id}/participants", (IParticipantService participantService, Guid id) =>
        {
            var response = participantService.GetByConversationIdIncludeContact(id);
            return Results.Ok(new ResponseModel<IEnumerable<ParticipantDto>>(response));
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Conversation).MapPost("/{id}/participants",
        async (IParticipantService participantService, Guid id, List<ParticipantDto> model, bool includeNotify) =>
        {
            var response = await participantService.AddAsync(id, model, includeNotify);
            return Results.Ok(new ResponseModel<IEnumerable<ParticipantDto>>(response));
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Conversation).MapGet("/{id}/messages",
        (IMessageService messageService, Guid id, int page, int limit) =>
        {
            var response = messageService.GetByConversationIdWithPaging(id, page, limit);
            return Results.Ok(new ResponseModel<IEnumerable<MessageNoReference>>(response));
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Conversation).MapGet("/{id}/attachments",
        (IAttachmentService attachmentService, Guid id) =>
        {
            var response = attachmentService.GetByConversationId(id);
            return Results.Ok(new ResponseModel<IEnumerable<AttachmentGroupByCreatedTime>>(response));
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Conversation).MapPost("/",
        async (IConversationService conversationService, ConversationDto model, bool includeNotify) =>
        {
            var response = await conversationService.CreateAsync(model, includeNotify);
            return Results.Ok(new ResponseModel<ConversationDto>(response));
        }).RequireAuthorization("AllUser");

        app.MapGroup(Constants.ApiRoute_Conversation).MapPatch("/{id}",
        (IConversationService conversationService, Guid id, JsonPatchDocument patch) =>
        {
            var response = conversationService.Patch(id, patch);
            return Results.Ok(new ResponseModel<ConversationDto>(response));
        }).RequireAuthorization("AllUser");
    }
}
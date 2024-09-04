namespace Presentation.Participants;

public static class UpdateParticipant
{
    public record Request(string id, JsonPatchDocument patch) : IRequest<Unit>;

    internal sealed class Handler(IUnitOfWork uow) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var filter = MongoQuery.IdFilter<Participant>(request.id);
            var entity = await uow.Participant.GetItemAsync(filter);
            await uow.Participant.UpdateOneAsync(filter, entity);
            return Unit.Value;
        }
    }
}

public class UpdateParticipantEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Participant).MapPatch("/{id}",
        async (string id, JsonElement jsonElement, ISender sender) =>
        {
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var query = new UpdateParticipant.Request(id, patch);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
namespace Presentation.Participants;

public static class UpdateParticipant
{
    public record Request(Guid id, JsonPatchDocument patch) : IRequest<Unit>;

    internal sealed class Handler(IParticipantService service) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            await service.PatchAsync(request.id, request.patch);
            return Unit.Value;
        }
    }
}

public class UpdateParticipantEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Participant).MapPatch("/{id}",
        async (Guid id, JsonElement jsonElement, ISender sender) =>
        {
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var query = new UpdateParticipant.Request(id, patch);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
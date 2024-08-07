namespace Presentation.Participants;

public static class UpdateParticipant
{
    public class Query : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public JsonPatchDocument Patch { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly IParticipantService _service;

        public Handler(IParticipantService service)
        {
            _service = service;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            await _service.PatchAsync(request.Id, request.Patch);
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
            var query = new UpdateParticipant.Query
            {
                Id = id,
                Patch = patch
            };
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
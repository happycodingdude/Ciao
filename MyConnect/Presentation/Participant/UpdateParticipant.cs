namespace Presentation.Participants;

public static class UpdateParticipant
{
    public record Request(string id, JsonPatchDocument patch) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IUnitOfWork uow;
        private readonly IParticipantRepository participantRepository;

        public Handler(IServiceScopeFactory scopeFactory, IUnitOfWork uow)
        {
            this.uow = uow;
            using (var scope = scopeFactory.CreateScope())
            {
                participantRepository = scope.ServiceProvider.GetService<IParticipantRepository>();
            }
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var filter = MongoQuery.IdFilter<Participant>(request.id);
            var entity = await participantRepository.GetItemAsync(filter);
            participantRepository.UpdateOne(filter, entity);
            await uow.SaveAsync();
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
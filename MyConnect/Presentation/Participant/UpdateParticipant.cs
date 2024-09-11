namespace Presentation.Participants;

public static class UpdateParticipant
{
    public record Request(string id, Participant model) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IUnitOfWork uow;
        private readonly IConversationRepository conversationRepository;

        public Handler(IServiceScopeFactory scopeFactory, IUnitOfWork uow)
        {
            this.uow = uow;
            using (var scope = scopeFactory.CreateScope())
            {
                conversationRepository = scope.ServiceProvider.GetService<IConversationRepository>();
            }
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var filter = Builders<Conversation>.Filter.Where(q => q.Participants.Any(w => w.Id == request.id));
            var conversation = (await conversationRepository.GetAllAsync(filter)).SingleOrDefault();
            conversation.Participants.FirstOrDefault(q => q.Id == request.id).IsNotifying = request.model.IsNotifying;
            conversation.Participants.FirstOrDefault(q => q.Id == request.id).IsDeleted = request.model.IsDeleted;

            var idFilter = MongoQuery.IdFilter<Conversation>(conversation.Id);
            var updates = Builders<Conversation>.Update
                .Set(q => q.Participants, conversation.Participants);
            conversationRepository.Update(idFilter, updates);

            await uow.SaveAsync();
            return Unit.Value;
        }
    }
}

public class UpdateParticipantEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Participant).MapPut("/{id}",
        async (ISender sender, string id, Participant model) =>
        {
            var query = new UpdateParticipant.Request(id, model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
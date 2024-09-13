namespace Presentation.Participants;

public static class UpdateParticipant
{
    public record Request(string id, Participant model) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IConversationRepository _conversationRepository;

        public Handler(IUnitOfWork uow)
        {
            _conversationRepository = uow.GetService<IConversationRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var filter = Builders<Conversation>.Filter.Where(q => q.Participants.Any(w => w.Id == request.id));
            var conversation = (await _conversationRepository.GetAllAsync(filter)).SingleOrDefault();
            conversation.Participants.FirstOrDefault(q => q.Id == request.id).IsNotifying = request.model.IsNotifying;
            conversation.Participants.FirstOrDefault(q => q.Id == request.id).IsDeleted = request.model.IsDeleted;

            var idFilter = MongoQuery<Conversation>.IdFilter(conversation.Id);
            var updates = Builders<Conversation>.Update
                .Set(q => q.Participants, conversation.Participants);
            _conversationRepository.Update(idFilter, updates);

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
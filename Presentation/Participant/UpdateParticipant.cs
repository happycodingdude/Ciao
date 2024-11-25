namespace Presentation.Participants;

public static class UpdateParticipant
{
    public record Request(string conversationId, Participant model) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;

        public Handler(IService<IConversationRepository> conversationService, IService<IContactRepository> contactService)
        {
            _conversationRepository = conversationService.Get();
            _contactRepository = contactService.Get();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var filter = MongoQuery<Conversation>.IdFilter(request.conversationId);
            var conversation = await _conversationRepository.GetItemAsync(filter);
            var user = await _contactRepository.GetInfoAsync();

            conversation.Participants.FirstOrDefault(q => q.Contact.Id == user.Id).IsNotifying = request.model.IsNotifying;
            var updates = Builders<Conversation>.Update
                .Set(q => q.Participants, conversation.Participants);
            _conversationRepository.UpdateNoTrackingTime(filter, updates);

            return Unit.Value;
        }
    }
}

public class UpdateParticipantEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Conversation).MapPut("/{conversationId}/participants",
        async (ISender sender, string conversationId, Participant model) =>
        {
            var query = new UpdateParticipant.Request(conversationId, model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
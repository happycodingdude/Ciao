namespace Presentation.Participants;

public static class DeleteParticipant
{
    public record Request(string conversationId) : IRequest<Unit>;

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
            if (conversation.Participants.FirstOrDefault(q => q.ContactId == user.Id).IsDeleted) return Unit.Value;

            conversation.Participants.FirstOrDefault(q => q.ContactId == user.Id).IsDeleted = true;
            var updates = Builders<Conversation>.Update
                .Set(q => q.Participants, conversation.Participants);
            _conversationRepository.UpdateNoTrackingTime(filter, updates);

            return Unit.Value;
        }
    }
}

public class DeleteParticipantEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapDelete("/{conversationId}/participants",
        async (ISender sender, string conversationId) =>
        {
            var query = new DeleteParticipant.Request(conversationId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}
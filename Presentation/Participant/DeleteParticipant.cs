namespace Presentation.Participants;

public static class DeleteParticipant
{
    public record Request(string conversationId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IConversationRepository _conversationRepository;

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
                _conversationRepository = scope.ServiceProvider.GetRequiredService<IConversationRepository>();
            }
            RuleFor(c => c.conversationId).ContactRelatedToConversation(_contactRepository, _conversationRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly MemberCache _memberCache;

        public Handler(IValidator<Request> validator, IConversationRepository conversationRepository, IContactRepository contactRepository, MemberCache memberCache)
        {
            _validator = validator;
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _memberCache = memberCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Conversation>.IdFilter(request.conversationId);
            var conversation = await _conversationRepository.GetItemAsync(filter);
            var userId = _contactRepository.GetUserId();
            var thisUser = conversation.Participants.SingleOrDefault(q => q.ContactId == userId);
            if (thisUser.IsDeleted) return Unit.Value;

            thisUser.IsDeleted = true;
            var updates = Builders<Conversation>.Update.Set(q => q.Participants, conversation.Participants);
            _conversationRepository.UpdateNoTrackingTime(filter, updates);

            // Update cache
            await _memberCache.MemberDelete(conversation.Id, userId);

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
namespace Presentation.Members;

public static class UpdateMember
{
    public record Request(string conversationId, bool? delete, bool? notify) : IRequest<Unit>;

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IConversationRepository _conversationRepository;
        readonly IContactRepository _contactRepository;
        readonly MemberCache _memberCache;

        public Handler(IConversationRepository conversationRepository, IContactRepository contactRepository, MemberCache memberCache)
        {
            _conversationRepository = conversationRepository;
            _contactRepository = contactRepository;
            _memberCache = memberCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            if ((!request.delete.HasValue && !request.notify.HasValue) || (request.delete.HasValue && request.notify.HasValue)) return Unit.Value;

            var filter = MongoQuery<Conversation>.IdFilter(request.conversationId);
            var conversation = await _conversationRepository.GetItemAsync(filter);
            var userId = _contactRepository.GetUserId();
            var thisUser = conversation.Members.SingleOrDefault(q => q.ContactId == userId);

            if (request.notify.HasValue)
            {
                thisUser.IsNotifying = request.notify.Value;
                _conversationRepository.ReplaceNoTrackingTime(filter, conversation);
                await _memberCache.MemberUpdateNotify(conversation.Id, userId, request.notify.Value);
            }
            else if (request.delete.Value == false && thisUser.IsDeleted)
            {
                thisUser.IsDeleted = false;
                _conversationRepository.Replace(filter, conversation);
                await _memberCache.MemberReopen(conversation.Id, userId, conversation.UpdatedTime.Value);
            }

            return Unit.Value;
        }
    }
}

public class UpdateMemberEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("/{conversationId}/members",
        async (ISender sender, string conversationId, bool? delete, bool? notify) =>
        {
            var query = new UpdateMember.Request(conversationId, delete, notify);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}
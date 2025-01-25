namespace Presentation.Conversations;

public static class GetConversations
{
    public record Request(int page, int limit) : IRequest<List<ConversationWithTotalUnseenWithContactInfo>>;

    internal sealed class Handler : IRequestHandler<Request, List<ConversationWithTotalUnseenWithContactInfo>>
    {
        readonly IContactRepository _contactRepository;
        readonly IMapper _mapper;
        readonly IKafkaProducer _kafkaProducer;
        readonly ConversationCache _conversationCache;
        readonly UserCache _userCache;
        readonly MemberCache _memberCache;

        public Handler(IContactRepository contactRepository, IMapper mapper, IKafkaProducer kafkaProducer, ConversationCache conversationCache, UserCache userCache, MemberCache memberCache)
        {
            _contactRepository = contactRepository;
            _mapper = mapper;
            _kafkaProducer = kafkaProducer;
            _conversationCache = conversationCache;
            _userCache = userCache;
            _memberCache = memberCache;
        }

        public async Task<List<ConversationWithTotalUnseenWithContactInfo>> Handle(Request request, CancellationToken cancellationToken)
        {
            var conversations = await _conversationCache.GetConversations();
            var result = _mapper.Map<List<ConversationWithTotalUnseenWithContactInfo>>(conversations);
            await _memberCache.GetMembers(result);
            // foreach (var conv in result)
            // {
            // Get member cache
            // conv.Participants = await _memberCache.GetMembers(conv.Id);

            // Query user cache to get updated info             
            // var contacts = await _userCache.GetListInfo(conv.Participants.Select(q => q.Contact.Id).ToList());
            // foreach (var contact in contacts)
            // {
            //     var participant = conv.Participants.SingleOrDefault(q => q.Contact.Id == contact.Id);
            //     participant.Contact.Name = contact.Name;
            //     participant.Contact.Avatar = contact.Avatar;
            //     participant.Contact.Bio = contact.Bio;
            //     participant.Contact.IsOnline = true;
            // }

            // Filter uncache contact then set offline and keep last cache info
            // var uncacheContacts = conv.Participants.Select(q => q.Contact.Id).Except(contacts.Select(q => q.Id));
            // conv.Participants.Where(q => uncacheContacts.Any(w => w == q.Contact.Id)).ToList()
            // .ForEach(q =>
            // {
            //     q.Contact.IsOnline = false;
            // });
            // }

            // await _conversationCache.SetConversations(result);
            // await _kafkaProducer.ProduceAsync(Topic.UpdateConversationCache, new UpdateConversationCacheModel
            // {
            //     Conversations = result,
            //     UserId = _contactRepository.GetUserId()
            // });

            return result.Where(q => q.Participants.SingleOrDefault(q => q.Contact.Id == _contactRepository.GetUserId()).IsDeleted == false).ToList();
            // return result;
        }
    }
}

public class GetConversationsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapGet("",
        async (ISender sender, int page = AppConstants.DefaultPage, int limit = AppConstants.DefaultLimit) =>
        {
            var query = new GetConversations.Request(page, limit);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
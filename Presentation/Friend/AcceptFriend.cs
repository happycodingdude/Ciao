namespace Presentation.Friends;

public static class AcceptFriend
{
    public record Request(string conversationId, string id) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IContactRepository _contactRepository;
        readonly IFriendRepository _friendRepository;

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _contactRepository = scope.ServiceProvider.GetRequiredService<IContactRepository>();
                _friendRepository = scope.ServiceProvider.GetRequiredService<IFriendRepository>();
            }
            RuleFor(c => c.id).ContactRelatedToFriendRequest(_contactRepository, _friendRepository).DependentRules(() =>
            {
                RuleFor(c => c).MustAsync((item, cancellation) => MustBeReceiver(item)).WithMessage("Only accept received request").DependentRules(() =>
                {
                    RuleFor(c => c.id).NotYetAccepted(_friendRepository);
                });
            });
        }

        async Task<bool> MustBeReceiver(Request request)
        {
            var user = await _contactRepository.GetInfoAsync();
            var friendRq = await _friendRepository.GetItemAsync(MongoQuery<Friend>.IdFilter(request.id));
            return friendRq.ToContact.ContactId == user.Id;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly IFirebaseFunction _firebase;
        readonly IFriendRepository _friendRepository;
        readonly MemberCache _memberCache;

        public Handler(IValidator<Request> validator,
            IFirebaseFunction firebase,
            IFriendRepository friendRepository,
            MemberCache memberCache)
        {
            _validator = validator;
            _firebase = firebase;
            _friendRepository = friendRepository;
            _memberCache = memberCache;
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Friend>.IdFilter(request.id);
            // var entity = await _friendRepository.GetItemAsync(filter);

            var updates = Builders<Friend>.Update.Set(q => q.AcceptTime, DateTime.Now);
            _friendRepository.Update(filter, updates);

            var members = await _memberCache.GetMembers(request.conversationId);
            var selected = members.SingleOrDefault(q => q.FriendId == request.id);
            selected.FriendStatus = "friend";
            await _memberCache.UpdateMembers(request.conversationId, members);

            // Push accepted request            
            //     await _firebase.Notify(
            //        "AcceptFriendRequest",
            //        new string[1] { entity.ToContact.ContactId },
            //        new FriendToNotify
            //        {
            //            RequestId = request.id
            //        }
            //    );

            return Unit.Value;
        }
    }
}

public class AcceptFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Conversation).MapPut("{conversationId}/friends/{id}",
        async (ISender sender, string conversationId, string id) =>
        {
            var query = new AcceptFriend.Request(conversationId, id);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization();
    }
}
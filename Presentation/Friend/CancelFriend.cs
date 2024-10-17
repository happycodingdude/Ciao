namespace Presentation.Friends;

public static class CancelFriend
{
    public record Request(string id) : IRequest<Unit>;

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
                RuleFor(c => c).MustAsync((item, cancellation) => MustBeSender(item)).WithMessage("Only cancel sent request").DependentRules(() =>
                {
                    RuleFor(c => c.id).NotYetAccepted(_friendRepository);
                });
            });
        }

        async Task<bool> MustBeSender(Request request)
        {
            var user = await _contactRepository.GetInfoAsync();
            var friendRq = await _friendRepository.GetItemAsync(MongoQuery<Friend>.IdFilter(request.id));
            return friendRq.FromContact.ContactId == user.Id;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        readonly IValidator<Request> _validator;
        readonly INotificationMethod _notificationMethod;
        readonly IFriendRepository _friendRepository;

        public Handler(IValidator<Request> validator,
            INotificationMethod notificationMethod,
            IService<IFriendRepository> service)
        {
            _validator = validator;
            _notificationMethod = notificationMethod;
            _friendRepository = service.Get();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Friend>.IdFilter(request.id);
            _friendRepository.DeleteOne(filter);

            // Push cancelled request
            //     var entity = await _friendRepository.GetItemAsync(filter);
            //     await _notificationMethod.Notify(
            //        "CancelFriendRequest",
            //        new string[1] { entity.ToContact.ContactId.ToString() },
            //        new FriendToNotify
            //        {
            //            RequestId = request.id
            //        }
            //    );

            return Unit.Value;
        }
    }
}

public class CancelFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapDelete("{id}",
        async (ISender sender, string id) =>
        {
            var query = new CancelFriend.Request(id);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
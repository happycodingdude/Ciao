namespace Presentation.Friends;

public static class CancelFriend
{
    public record Request(string id, string userId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IFriendRepository _friendRepository;

        public Validator(IServiceScopeFactory scopeFactory)
        {
            using (var scope = scopeFactory.CreateScope())
            {
                _friendRepository = scope.ServiceProvider.GetService<IFriendRepository>();
            }
            RuleFor(c => c.id).MustAsync((item, cancellation) => NotYetAccepted(item)).WithMessage("Friend request has been accepted");
            RuleFor(c => c).MustAsync((item, cancellation) => NotReceivedRequest(item)).WithMessage("Can not cancel received request");
        }

        private async Task<bool> NotYetAccepted(string id)
        {
            var sent = await _friendRepository.GetItemAsync(MongoQuery.IdFilter<Friend>(id));
            return !sent.AcceptTime.HasValue;
        }

        private async Task<bool> NotReceivedRequest(Request request)
        {
            var sent = await _friendRepository.GetItemAsync(MongoQuery.IdFilter<Friend>(request.id));
            return sent.ToContact.ContactId != request.userId;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> validator;
        private readonly INotificationMethod notificationMethod;
        private readonly IUnitOfWork uow;
        private readonly IFriendRepository friendRepository;

        public Handler(IValidator<Request> validator, INotificationMethod notificationMethod, IUnitOfWork uow, IServiceScopeFactory scopeFactory)
        {
            this.validator = validator;
            this.notificationMethod = notificationMethod;
            this.uow = uow;
            using (var scope = scopeFactory.CreateScope())
            {
                friendRepository = scope.ServiceProvider.GetService<IFriendRepository>();
            }
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery.IdFilter<Friend>(request.id);
            friendRepository.DeleteOne(filter);
            await uow.SaveAsync();

            // Push cancelled request
            var entity = await friendRepository.GetItemAsync(filter);
            await notificationMethod.Notify(
               "CancelFriendRequest",
               new string[1] { entity.ToContact.ContactId.ToString() },
               new FriendToNotify
               {
                   RequestId = request.id
               }
           );

            return Unit.Value;
        }
    }
}

public class CancelFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapDelete("{id}",
        async (HttpContext context, ISender sender, string id) =>
        {
            var userId = context.Session.GetString("UserId");
            var query = new CancelFriend.Request(id, userId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
namespace Presentation.Friends;

public static class CancelFriend
{
    public record Request(string id, string userId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IFriendRepository _friendRepository;

        // public Validator(IUnitOfWork uow)
        // {
        //     _friendRepository = uow.GetService<IFriendRepository>();
        //     RuleFor(c => c.id).MustAsync((item, cancellation) => NotYetAccepted(item)).WithMessage("Friend request has been accepted");
        //     RuleFor(c => c).MustAsync((item, cancellation) => NotReceivedRequest(item)).WithMessage("Can not cancel received request");
        // }

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _friendRepository = scope.ServiceProvider.GetRequiredService<IFriendRepository>();
            }
            RuleFor(c => c.id).MustAsync((item, cancellation) => NotYetAccepted(item)).WithMessage("Friend request has been accepted");
            RuleFor(c => c).MustAsync((item, cancellation) => NotReceivedRequest(item)).WithMessage("Can not cancel received request");
        }

        async Task<bool> NotYetAccepted(string id)
        {
            var sent = await _friendRepository.GetItemAsync(MongoQuery<Friend>.IdFilter(id));
            return !sent.AcceptTime.HasValue;
        }

        async Task<bool> NotReceivedRequest(Request request)
        {
            var sent = await _friendRepository.GetItemAsync(MongoQuery<Friend>.IdFilter(request.id));
            return sent.ToContact.ContactId != request.userId;
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> _validator;
        private readonly INotificationMethod _notificationMethod;
        private readonly IFriendRepository _friendRepository;

        public Handler(IValidator<Request> validator,
            INotificationMethod notificationMethod,
            IUnitOfWork uow)
        {
            _validator = validator;
            _notificationMethod = notificationMethod;
            _friendRepository = uow.GetService<IFriendRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Friend>.IdFilter(request.id);
            _friendRepository.DeleteOne(filter);

            // Push cancelled request
            var entity = await _friendRepository.GetItemAsync(filter);
            await _notificationMethod.Notify(
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
            var userId = context.Items["UserId"]?.ToString();
            var query = new CancelFriend.Request(id, userId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
namespace Presentation.Friends;

public static class CreateFriend
{
    public record Request(Guid fromContactId, Guid toContactId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IUnitOfWork _uow;

        public Validator(IUnitOfWork uow)
        {
            _uow = uow;
            RuleFor(c => c.toContactId).NotEmpty().WithMessage("Friend request should be sent to 1 contact");
            RuleFor(c => c).MustAsync((item, cancellation) => UniqueRequest(item)).WithMessage("Friend request has been sent");
            RuleFor(c => c.toContactId).NotEqual(q => q.fromContactId).WithMessage("Can not send self-request");
        }

        private async Task<bool> UniqueRequest(Request request)
        {
            var sent = _uow.Friend.DbSet
                    .Any(q => (q.FromContactId == request.fromContactId && q.ToContactId == request.toContactId)
                            || q.FromContactId == request.toContactId && q.ToContactId == request.fromContactId);
            return !sent;
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IUnitOfWork uow, IMapper mapper, INotificationMethod notificationMethod) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Add friend 
            var friendEntity = new Friend
            {
                FromContactId = request.fromContactId,
                ToContactId = request.toContactId
            };
            uow.Friend.Add(friendEntity);
            // Add notification
            var contact = await uow.Contact.GetByIdAsync(request.fromContactId);
            var notiEntity = new Notification
            {
                SourceId = friendEntity.Id.ToString(),
                SourceType = "friend_request",
                Content = $"{contact.Name} send you a request",
                ContactId = request.toContactId.ToString()
            };
            await uow.Notification.AddAsync(notiEntity);

            await uow.SaveAsync();

            // Push friend request
            await notificationMethod.Notify(
               "NewFriendRequest",
               new string[1] { request.toContactId.ToString() },
               new FriendToNotify
               {
                   RequestId = friendEntity.Id
               }
           );
            // Push notification
            var notiDto = mapper.Map<Notification, NotificationTypeConstraint>(notiEntity);
            notiDto.AddSourceData(friendEntity);
            await notificationMethod.Notify(
                "NewNotification",
                new string[1] { request.toContactId.ToString() },
                notiDto
            );

            return Unit.Value;
        }
    }
}

public class CreateFriendEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapPost("{id}",
        async (HttpContext context, ISender sender, Guid id) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new CreateFriend.Request(userId, id);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
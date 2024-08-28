namespace Presentation.Friends;

public static class CreateFriend
{
    public record Request(Guid userId, Guid contactId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IUnitOfWork _uow;

        public Validator(IUnitOfWork uow)
        {
            _uow = uow;
            RuleFor(c => c.contactId).NotEmpty().WithMessage("Friend request should be sent to 1 contact");
            RuleFor(c => c).MustAsync((item, cancellation) => UniqueRequest(item)).WithMessage("Friend request has been sent");
            RuleFor(c => c.userId).NotEqual(q => q.contactId).WithMessage("Can not send self-request");
        }

        private async Task<bool> UniqueRequest(Request request)
        {
            var sent = await _uow.Friend.GetAllAsync(d =>
                (d.FromContact.ContactId == request.userId.ToString() && d.ToContact.ContactId == request.contactId.ToString()) ||
                (d.FromContact.ContactId == request.contactId.ToString() && d.ToContact.ContactId == request.userId.ToString()));

            return !sent.Any();
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IUnitOfWork uow, IMapper mapper, INotificationMethod notificationMethod) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var fromContact = await uow.Contact.GetItemAsync(d => d.Id == request.userId.ToString());
            var toContact = await uow.Contact.GetItemAsync(d => d.Id == request.contactId.ToString());
            // Add friend 
            var friendEntity = new Friend
            {
                FromContact = new FriendDto_Contact
                {
                    ContactId = request.userId.ToString(),
                    ContactName = fromContact.Name
                },
                ToContact = new FriendDto_Contact
                {
                    ContactId = request.contactId.ToString(),
                    ContactName = toContact.Name
                },
            };
            await uow.Friend.AddAsync(friendEntity);
            // Add notification            
            var notiEntity = new Notification
            {
                SourceId = friendEntity.Id.ToString(),
                SourceType = "friend_request",
                Content = $"{fromContact.Name} send you a request",
                ContactId = request.contactId.ToString()
            };
            await uow.Notification.AddAsync(notiEntity);

            // await uow.SaveAsync();

            // Push friend request
            await notificationMethod.Notify(
               "NewFriendRequest",
               new string[1] { request.contactId.ToString() },
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
                new string[1] { request.contactId.ToString() },
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
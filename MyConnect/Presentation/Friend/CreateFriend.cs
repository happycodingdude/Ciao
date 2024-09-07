namespace Presentation.Friends;

public static class CreateFriend
{
    public record Request(string userId, string contactId) : IRequest<Unit>;

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
            var filter = Builders<Friend>.Filter.Where(q =>
                (q.FromContact.ContactId == request.userId.ToString() && q.ToContact.ContactId == request.contactId.ToString()) ||
                (q.FromContact.ContactId == request.contactId.ToString() && q.ToContact.ContactId == request.userId.ToString()));
            var sent = await _uow.Friend.GetAllAsync(filter);
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

            var fromContact = await uow.Contact.GetItemAsync(MongoQuery.IdFilter<Contact>(request.userId));
            var toContact = await uow.Contact.GetItemAsync(MongoQuery.IdFilter<Contact>(request.contactId));
            // Add friend 
            var friendEntity = new Friend
            {
                FromContact = new FriendDto_Contact
                {
                    ContactId = request.userId,
                    ContactName = fromContact.Name
                },
                ToContact = new FriendDto_Contact
                {
                    ContactId = request.contactId,
                    ContactName = toContact.Name
                },
            };
            uow.Friend.AddAsync(friendEntity);
            // Add notification            
            var notiEntity = new Notification
            {
                SourceId = friendEntity.Id,
                SourceType = "friend_request",
                Content = $"{fromContact.Name} send you a request",
                ContactId = request.contactId
            };
            uow.Notification.AddAsync(notiEntity);

            // await uow.SaveAsync();

            // Push friend request
            await notificationMethod.Notify(
               "NewFriendRequest",
               new string[1] { request.contactId },
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
                new string[1] { request.contactId },
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
        app.MapGroup(AppConstants.ApiRoute_Contact).MapPost("{contactId}/friends",
        async (HttpContext context, ISender sender, string contactId) =>
        {
            var userId = context.Session.GetString("UserId");
            var query = new CreateFriend.Request(userId, contactId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
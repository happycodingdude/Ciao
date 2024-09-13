namespace Presentation.Friends;

public static class CreateFriend
{
    public record Request(string contactId, string userId) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        readonly IFriendRepository _friendRepository;

        // public Validator(IUnitOfWork uow)
        // {
        //     _friendRepository = uow.GetService<IFriendRepository>();
        //     RuleFor(c => c.contactId).NotEmpty().WithMessage("Friend request should be sent to 1 contact");
        //     RuleFor(c => c).MustAsync((item, cancellation) => UniqueRequest(item)).WithMessage("Friend request has been sent");
        //     RuleFor(c => c.userId).NotEqual(q => q.contactId).WithMessage("Can not send self-request");
        // }

        public Validator(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                _friendRepository = scope.ServiceProvider.GetRequiredService<IFriendRepository>();
            }
            RuleFor(c => c.contactId).NotEmpty().WithMessage("Friend request should be sent to 1 contact");
            RuleFor(c => c).MustAsync((item, cancellation) => UniqueRequest(item)).WithMessage("Friend request has been sent");
            RuleFor(c => c.userId).NotEqual(q => q.contactId).WithMessage("Can not send self-request");
        }

        async Task<bool> UniqueRequest(Request request)
        {
            var filter = Builders<Friend>.Filter.Where(q =>
                (q.FromContact.ContactId == request.userId && q.ToContact.ContactId == request.contactId) ||
                (q.FromContact.ContactId == request.contactId && q.ToContact.ContactId == request.userId));
            var sent = await _friendRepository.GetAllAsync(filter);
            return !sent.Any();
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> _validator;
        private readonly INotificationMethod _notificationMethod;
        private readonly IMapper _mapper;
        private readonly IContactRepository _contactRepository;
        private readonly IFriendRepository _friendRepository;
        private readonly INotificationRepository _notificationRepository;

        public Handler(IValidator<Request> validator,
            INotificationMethod notificationMethod,
            IMapper mapper,
            IUnitOfWork uow)
        {
            _validator = validator;
            _notificationMethod = notificationMethod;
            _mapper = mapper;
            _contactRepository = uow.GetService<IContactRepository>();
            _friendRepository = uow.GetService<IFriendRepository>();
            _notificationRepository = uow.GetService<INotificationRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            // Add friend 
            var fromContact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(request.userId));
            var toContact = await _contactRepository.GetItemAsync(MongoQuery<Contact>.IdFilter(request.contactId));
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
            _friendRepository.Add(friendEntity);
            // Add notification            
            var notiEntity = new Notification
            {
                SourceId = friendEntity.Id,
                SourceType = "friend_request",
                Content = $"{fromContact.Name} send you a request",
                ContactId = request.contactId
            };
            _notificationRepository.Add(notiEntity);

            // Push friend request
            await _notificationMethod.Notify(
               "NewFriendRequest",
               new string[1] { request.contactId },
               new FriendToNotify
               {
                   RequestId = friendEntity.Id
               }
           );
            // Push notification
            var notiDto = _mapper.Map<Notification, NotificationTypeConstraint>(notiEntity);
            notiDto.AddSourceData(friendEntity);
            await _notificationMethod.Notify(
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
            var userId = context.Items["UserId"]?.ToString();
            var query = new CreateFriend.Request(contactId, userId);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
namespace Chat.API.Features.Contacts;

public static class CancelFriend
{
    public class Query : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public Guid ContactId { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        readonly IServiceScopeFactory _scopeFactory;

        public Validator(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
            RuleFor(c => c.Id).Must(NotYetAccepted).WithMessage("Friend request has been accepted");
            RuleFor(c => c).Must(NotReceivedRequest).WithMessage("Can not cancel received request");
        }

        private bool NotYetAccepted(Guid id)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var sent = dbContext.Friends.Find(id);
                return !sent.AcceptTime.HasValue;
            }
        }

        private bool NotReceivedRequest(Query request)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var sent = dbContext.Friends.Find(request.Id);
                return sent.ToContactId != request.ContactId;
            }
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly IValidator<Query> _validator;
        private readonly INotificationMethod _notificationMethod;
        private readonly IUnitOfWork _uow;


        public Handler(IValidator<Query> validator, INotificationMethod notificationMethod, IUnitOfWork uow)
        {
            _validator = validator;
            _notificationMethod = notificationMethod;
            _uow = uow;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var entity = await _uow.Friend.GetByIdAsync(request.Id);
            _uow.Friend.Delete(request.Id);
            await _uow.SaveAsync();

            // Push friend request            
            await _notificationMethod.Notify(
               "CancelFriendRequest",
               new string[1] { entity.ToContactId.ToString() },
               new FriendToNotify
               {
                   RequestId = request.Id
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
        async (HttpContext context, ISender sender, Guid id) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new CancelFriend.Query
            {
                Id = id,
                ContactId = userId
            };
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
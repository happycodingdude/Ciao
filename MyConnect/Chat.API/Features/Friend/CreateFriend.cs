namespace Chat.API.Features.Friends;

public static class CreateFriend
{
    public class Query : IRequest<Unit>
    {
        public Guid FromContactId { get; set; }
        public Guid ToContactId { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(c => c.ToContactId).NotEmpty().WithMessage("Friend request should be sent to 1 contact");
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly IValidator<Query> _validator;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly IFirebaseFunction _firebaseFunction;

        public Handler(IValidator<Query> validator, IUnitOfWork uow, IMapper mapper, IFirebaseFunction firebaseFunction)
        {
            _uow = uow;
            _validator = validator;
            _mapper = mapper;
            _firebaseFunction = firebaseFunction;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var entity = new Friend
            {
                FromContactId = request.FromContactId,
                ToContactId = request.ToContactId
            };
            _uow.Friend.Add(entity);

            var contact = await _uow.Contact.GetByIdAsync(request.FromContactId);
            var notiEntity = new Notification
            {
                SourceId = entity.Id,
                SourceType = "friend_request",
                Content = $"{contact.Name} send you a request",
                ContactId = request.ToContactId
            };
            _uow.Notification.Add(notiEntity);

            await _uow.SaveAsync();

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
            var query = new CreateFriend.Query
            {
                FromContactId = userId,
                ToContactId = id
            };
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
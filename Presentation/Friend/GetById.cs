namespace Presentation.Friends;

public static class GetById
{
    public record Request(string id) : IRequest<FriendWithStatus>;

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
            RuleFor(c => c.id).ContactRelatedToFriendRequest(_contactRepository, _friendRepository);
        }
    }

    internal sealed class Handler : IRequestHandler<Request, FriendWithStatus>
    {
        readonly IValidator<Request> _validator;
        readonly IMapper _mapper;
        readonly IFriendRepository _friendRepository;

        public Handler(IValidator<Request> validator, IMapper mapper, IFriendRepository friendRepository)
        {
            _validator = validator;
            _mapper = mapper;
            _friendRepository = friendRepository;
        }

        public async Task<FriendWithStatus> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = MongoQuery<Friend>.IdFilter(request.id);
            var friend = await _friendRepository.GetItemAsync(filter);
            var result = _mapper.Map<Friend, FriendWithStatus>(friend);
            result.Status = await _friendRepository.GetFriendStatusAsync(friend);
            return result;
        }
    }
}

public class GetByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Friend).MapGet("/{id}",
        async (ISender sender, string id) =>
        {
            var query = new GetById.Request(id);
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
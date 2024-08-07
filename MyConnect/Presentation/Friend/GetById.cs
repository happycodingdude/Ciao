namespace Presentation.Friends;

public static class GetById
{
    public class Query : IRequest<FriendDto>
    {
        public Guid Id { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, FriendDto>
    {
        private readonly IFriendService _service;

        public Handler(IFriendService service)
        {
            _service = service;
        }

        public async Task<FriendDto> Handle(Query request, CancellationToken cancellationToken)
        {
            return await _service.GetByIdAsync(request.Id);
        }
    }
}

public class GetByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Friend).MapGet("/{id}",
        async (ISender sender, Guid id) =>
        {
            var query = new GetById.Query
            {
                Id = id
            };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
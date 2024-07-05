public static class GetInfo
{
    public class Query : IRequest<ContactDto>
    {
        public Guid Id { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, ContactDto>
    {
        private readonly IContactService _service;

        public Handler(IContactService service)
        {
            _service = service;
        }

        public async Task<ContactDto> Handle(Query request, CancellationToken cancellationToken)
        {
            return await _service.GetByIdAsync(request.Id);
        }
    }
}

public class GetInfoEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapGet("/info",
        async (HttpContext context, ISender sender) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new GetInfo.Query { Id = userId };
            var result = await sender.Send(query);
            return Results.Ok(result);
        }).RequireAuthorization("AllUser");
    }
}
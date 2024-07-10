public static class CreateContact
{
    public class Query : IRequest<Unit>
    {
        public ContactDto Model { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly IContactService _service;

        public Handler(IContactService service)
        {
            _service = service;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            await _service.AddAsync(request.Model);
            return Unit.Value;
        }
    }
}

public class CreateContactEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapPost("",
        async (ContactDto model, ISender sender) =>
        {
            var query = new CreateContact.Query
            {
                Model = model
            };
            await sender.Send(query);
            return Results.Ok();
        });
    }
}
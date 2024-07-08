public static class CreateContact
{
    public class Query : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
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
            var contact = new ContactDto
            {
                Id = request.Id,
                Name = request.Name
            };
            await _service.AddAsync(contact);
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
                Id = model.Id,
                Name = model.Name
            };
            await sender.Send(query);
            return Results.Ok();
        });
    }
}
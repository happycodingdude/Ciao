public static class CreateContact
{
    public class Query : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly AppDbContext _dbContext;

        public Handler(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var contact = new Contact
            {
                Id = request.Id,
                Name = request.Name
            };
            _dbContext.Contacts.Add(contact);
            await _dbContext.SaveChangesAsync(cancellationToken);
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
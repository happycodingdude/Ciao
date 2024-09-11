namespace Presentation.Contacts;

public static class UpdateContact
{
    public record Request(Contact model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.model.Name).NotEmpty().WithMessage("Name should not be empty");
        }
    }

    internal sealed class Handler : IRequestHandler<Request, Unit>
    {
        private readonly IValidator<Request> validator;
        private readonly IUnitOfWork uow;
        private readonly IContactRepository contactRepository;

        public Handler(IValidator<Request> validator, IUnitOfWork uow, IServiceScopeFactory scopeFactory)
        {
            this.validator = validator;
            this.uow = uow;
            using (var scope = scopeFactory.CreateScope())
            {
                contactRepository = scope.ServiceProvider.GetService<IContactRepository>();
            }
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var filter = Builders<Contact>.Filter.Empty;
            var updates = Builders<Contact>.Update
                .Set(q => q.Name, request.model.Name)
                .Set(q => q.Bio, request.model.Bio);
            contactRepository.Update(filter, updates);
            await uow.SaveAsync();

            return Unit.Value;
        }
    }
}

public class UpdateContactEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapPut("",
        async (ISender sender, Contact model) =>
        {
            var query = new UpdateContact.Request(model);
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
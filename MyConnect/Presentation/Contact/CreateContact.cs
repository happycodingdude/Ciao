namespace Presentation.Contacts;

public static class CreateContact
{
    public record Request(ContactDto model) : IRequest<Unit>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.model.Name).NotEmpty().WithMessage("Name should not be empty");
        }
    }

    internal sealed class Handler(IValidator<Request> validator, IUnitOfWork uow, IMapper mapper) : IRequestHandler<Request, Unit>
    {
        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var entity = mapper.Map<ContactDto, Contact>(request.model);
            uow.Contact.Add(entity);
            await uow.SaveAsync();

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
            var query = new CreateContact.Request(model);
            await sender.Send(query);
            return Results.Ok();
        });
    }
}
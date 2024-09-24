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
        readonly IValidator<Request> _validator;
        readonly IHttpContextAccessor _httpContextAccessor;
        readonly IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator,
            IHttpContextAccessor httpContextAccessor,
            IService<IContactRepository> service)
        {
            _validator = validator;
            _httpContextAccessor = httpContextAccessor;
            _contactRepository = service.Get();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var userId = _httpContextAccessor.HttpContext.Items["UserId"].ToString();
            var filter = Builders<Contact>.Filter.Where(q => q.UserId == userId);
            var updates = Builders<Contact>.Update
                .Set(q => q.Name, request.model.Name)
                .Set(q => q.Bio, request.model.Bio);
            _contactRepository.Update(filter, updates);

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
namespace Chat.API.Features.Contacts;

public static class CreateContact
{
    public class Query : IRequest<Unit>
    {
        public ContactDto Model { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(c => c.Model.Name).NotEmpty().WithMessage("Name should not be empty");
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly IValidator<Query> _validator;
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public Handler(IValidator<Query> validator, IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _validator = validator;
            _mapper = mapper;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var entity = _mapper.Map<ContactDto, Contact>(request.Model);
            _uow.Contact.Add(entity);
            await _uow.SaveAsync();

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
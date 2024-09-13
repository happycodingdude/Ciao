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
        private readonly IValidator<Request> _validator;
        private readonly IUnitOfWork _uow;
        private IContactRepository _contactRepository;

        public Handler(IValidator<Request> validator, IUnitOfWork uow)
        {
            _validator = validator;
            _uow = uow;
            _contactRepository = uow.GetService<IContactRepository>();
        }

        public async Task<Unit> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            _ = _contactRepository.TrackChangeAsync(CollectionChange);
            var filter = MongoQuery<Contact>.EmptyFilter();
            var updates = Builders<Contact>.Update
                .Set(q => q.Name, request.model.Name)
                .Set(q => q.Bio, request.model.Bio);
            _contactRepository.Update(filter, updates);

            return Unit.Value;
        }

        async Task CollectionChange(ChangeStreamDocument<Contact> change)
        {
            Contact changed = change.FullDocument;
            Console.WriteLine($"changed => {changed.Id}");
            // Cập nhật lại collection All để làm search
            _contactRepository = _uow.GetService<IContactRepository>();
            _contactRepository.UseDatabase(typeof(Contact).Name, "All");
            var filter = MongoQuery<Contact>.IdFilter(changed.Id);
            var updates = Builders<Contact>.Update
                .Set(q => q.Name, changed.Name)
                .Set(q => q.Bio, changed.Bio);
            _contactRepository.Update(filter, updates);
            await _uow.SaveAsync();
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
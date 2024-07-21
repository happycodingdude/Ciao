namespace Chat.API.Features.Contacts;

public static class UpdateContact
{
    public class Query : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public JsonPatchDocument Patch { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(c => c.Patch.Operations.Where(q => q.path.ToLower() == nameof(ContactDto.Name).ToLower()).Select(q => q.value.ToString()))
                .Must(q => q.All(w => !string.IsNullOrEmpty(w)))
                .WithMessage("Name should not be empty");
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly IContactService _service;
        private readonly IValidator<Query> _validator;


        public Handler(IContactService service, IValidator<Query> validator)
        {
            _service = service;
            _validator = validator;
        }

        public async Task<Unit> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            await _service.PatchAsync(request.Id, request.Patch);

            return Unit.Value;
        }
    }
}

public class UpdateContactEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Contact).MapPatch("",
        async (HttpContext context, JsonElement jsonElement, ISender sender) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var query = new UpdateContact.Query
            {
                Id = userId,
                Patch = patch
            };
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
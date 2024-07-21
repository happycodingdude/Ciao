namespace Chat.API.Features.Contacts;

public static class UpdateNotification
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
        }
    }

    internal sealed class Handler : IRequestHandler<Query, Unit>
    {
        private readonly INotificationService _service;
        private readonly IValidator<Query> _validator;


        public Handler(INotificationService service, IValidator<Query> validator)
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

public class UpdateNotificationEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Notification).MapPatch("/{id}",
        async (HttpContext context, Guid id, JsonElement jsonElement, ISender sender) =>
        {
            var json = jsonElement.GetRawText();
            var patch = JsonConvert.DeserializeObject<JsonPatchDocument>(json);
            var query = new UpdateNotification.Query
            {
                Id = id,
                Patch = patch
            };
            await sender.Send(query);
            return Results.Ok();
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
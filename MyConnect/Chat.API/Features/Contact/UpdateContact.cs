public static class UpdateContact
{
    public class Query : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public JsonPatchDocument Patch { get; set; }
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
        }).RequireAuthorization("AllUser");
    }
}
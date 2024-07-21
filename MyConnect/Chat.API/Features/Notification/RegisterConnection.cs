namespace Chat.API.Features.Conversations;

public static class RegisterConnection
{
    public class Query : IRequest<bool>
    {
        public Guid ContactId { get; set; }
        public string Token { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(c => c.Token).NotEmpty().WithMessage("Token should not be empty");
        }
    }

    internal sealed class Handler : IRequestHandler<Query, bool>
    {
        private readonly IValidator<Query> _validator;

        public Handler(IValidator<Query> validator)
        {
            _validator = validator;
        }

        public async Task<bool> Handle(Query request, CancellationToken cancellationToken)
        {
            var validationResult = _validator.Validate(request);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            return Utils.RedisCLient.Db.StringSet($"connection-{request.ContactId}", request.Token);
        }
    }
}

public class RegisterConnectionEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiRoute_Notification).MapPost("",
        async (HttpContext context, ISender sender, string token) =>
        {
            var userId = Guid.Parse(context.Session.GetString("UserId"));
            var query = new RegisterConnection.Query
            {
                ContactId = userId,
                Token = token
            };
            var response = await sender.Send(query);
            return Results.Ok(response);
        }).RequireAuthorization(AppConstants.Authentication_Basic);
    }
}
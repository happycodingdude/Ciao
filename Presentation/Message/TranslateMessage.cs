namespace Presentation.Messages;

public static class TranslateMessage
{
    public record Request(TranslateMessageReq model) : IRequest<TranslateMessageRes>;

    public class Validator : AbstractValidator<Request>
    {
        public Validator()
        {
            RuleFor(c => c.model.Text).NotEmpty().WithMessage("Text to translate should not be empty");
        }
    }

    internal sealed class Handler : IRequestHandler<Request, TranslateMessageRes>
    {
        readonly IValidator<Request> _validator;
        readonly ITranslationService _translationService;

        public Handler(IValidator<Request> validator, ITranslationService translationService)
        {
            _validator = validator;
            _translationService = translationService;
        }

        public async Task<TranslateMessageRes> Handle(Request request, CancellationToken cancellationToken)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
                throw new BadRequestException(validationResult.ToString());

            var result = await _translationService.TranslateAsync(
                request.model.Text,
                request.model.TargetLang ?? "vi",
                cancellationToken);

            return new TranslateMessageRes
            {
                TranslatedText = result.TranslatedText,
                DetectedSourceLang = result.DetectedSourceLang,
            };
        }
    }
}

public class TranslateMessageEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGroup(AppConstants.ApiGroup_Message).MapPost("/translate",
        async (ISender sender, TranslateMessageReq model) =>
        {
            var result = await sender.Send(new TranslateMessage.Request(model));
            return Results.Ok(result);
        }).RequireAuthorization();
    }
}
